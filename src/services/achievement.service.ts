import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import axios from 'axios';
import { Repository } from 'typeorm';
import { Achievement } from '../entities/achievement.entity';
import { InjectRepository } from '@nestjs/typeorm';

import { ConfigService } from '@nestjs/config';
import {
  IAchieveUserStat,
  ICompletedRateFromSteam,
} from 'src/types/steam.api.type';
@Injectable()
export class AchievementService {
  constructor(
    @InjectRepository(Achievement)
    private readonly achievementRepository: Repository<Achievement>,
    private readonly configService: ConfigService,
  ) {}
  /** 도전과제 데이터 있는지 확인 */
  async checkAchieveExist(gmaeId: number) {
    const exist = await this.achievementRepository.exists({
      where: { game_id: gmaeId },
    });
    return exist;
  }

  /** db에서 id로 도전과제 가져오기 */
  async getAchievementById(id: number) {
    const result = await this.achievementRepository.findOne({ where: { id } });
    if (!result) {
      throw new NotFoundException('해당 도전과제는 존재하지 않습니다.');
    }
    return result;
  }

  async fetchAchievesAndRate(
    gameId: number,
    steamId: string,
    isInit: boolean = false,
  ) {
    if (isInit) {
      const saved = await this.initSaveAchievement(gameId);
      await this.updateAchievementCompletionRates(gameId, saved);
    } else {
      const achieves = await this.achievementRepository.find({
        where: { game_id: gameId },
      });
      await this.updateAchievementCompletionRates(gameId, achieves);
    }
    return await this.getAllAchievementAboutUser(gameId, steamId);
  }

  /** 해당 게임 도전과제 메타 데이터 db에 저장 */
  async initSaveAchievement(gameId: number) {
    const totalAchievements = await this.getAchieveFromSteam(gameId);
    /** 저장할 도전과제 데이터 청크 */
    const achieveChunk: Achievement[] = [];
    for (const achievement of totalAchievements) {
      const newAchievement = new Achievement();
      newAchievement.description = achievement.description;
      newAchievement.displayName = achievement.displayName;
      newAchievement.game_id = gameId;
      newAchievement.icon = achievement.icon;
      newAchievement.icon_gray = achievement.icongray;
      newAchievement.name = achievement.name;

      achieveChunk.push(newAchievement);
    }

    try {
      const savedAchieves = await this.achievementRepository.save(achieveChunk);
      return savedAchieves;
    } catch (error) {
      throw new InternalServerErrorException('도전과제 저장 실패F');
    }
  }

  /** db에 저장된 도전과제의 달성률 업데이트 */
  async updateAchievementCompletionRates(
    gameId: number,
    achieves: Achievement[],
  ) {
    const curCompleteRate = await this.getCompleteRateFromSteam(gameId);

    const map = new Map<string, ICompletedRateFromSteam>();
    for (const rate of curCompleteRate) {
      map.set(rate.name, rate);
    }
    /** 업데이트할 도전과제 데이터 청크 */
    const updatedChunk: Achievement[] = [];
    for (const achievement of achieves) {
      (achievement.completed_rate = map.get(achievement.name).percent),
        updatedChunk.push(achievement);
    }

    try {
      const updated = await this.achievementRepository.save(updatedChunk);
      return updated;
    } catch (error) {
      throw new InternalServerErrorException(
        '달성률 업데이트 데이터 저장 실패',
      );
    }
  }

  /** 유저 데이터 가져와서 각 도전과제 달성 여부 합치기 */
  async getAllAchievementAboutUser(gameId: number, steamid: string) {
    const [userStats, allAchieves] = await Promise.all([
      this.getUserAchievementFromSteam(gameId, steamid),
      this.achievementRepository.find({ where: { game_id: gameId } }),
    ]);

    if (allAchieves.length === 0) {
      throw new NotFoundException(
        '해당 게임에 대한 도전과제 데이터가 없습니다.',
      );
    }
    const userAchievementsMap = new Map<string, IAchieveUserStat>();
    for (const userStat of userStats) {
      userAchievementsMap.set(userStat.apiname, userStat);
    }
    const achievements = allAchieves.map((achieve) => {
      const unlocktime =
        userAchievementsMap.get(achieve.name).unlocktime * 1000;
      return {
        id: achieve.id,
        displayName: achieve.displayName,
        description: achieve.description,
        achieved: userAchievementsMap.get(achieve.name).achieved,
        unlockTime: unlocktime === 0 ? null : new Date(unlocktime),
        img:
          userAchievementsMap.get(achieve.name).achieved === 0
            ? achieve.icon_gray
            : achieve.icon,
        completedRate: achieve.completed_rate,
      };
    });
    return achievements;
  }

  //---------------------- Steam api -----------------------

  /** 스팀에서 도전과제 데이터 가져오기 */
  async getAchieveFromSteam(gameId: number) {
    try {
      const steamApiKey = this.configService.get<string>('STEAM_API_KEY');
      const achievements = (
        await axios.get(
          `http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?appid=${gameId}&key=${steamApiKey}&l=koreana`,
        )
      ).data.game.availableGameStats.achievements;
      return achievements;
    } catch (error) {
      throw new ServiceUnavailableException(
        '스팀 도전과제 데이터 api요청 실패',
      );
    }
  }
  /** 스팀에서 유저 도전과제 진행상태 가져오기 */
  async getUserAchievementFromSteam(gameId: number, steamId: string) {
    try {
      const steamApiKey = this.configService.get<string>('STEAM_API_KEY');
      const statusUserAchievements = (
        await axios.get(
          `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v1/?appid=${gameId}&key=${steamApiKey}&steamid=${steamId}`,
        )
      ).data.playerstats.achievements;

      return statusUserAchievements;
    } catch {
      throw new ServiceUnavailableException('스팀 유저 진행상황 api요청 실패');
    }
  }

  /** 스팀에서 도전과제 달성률 가져오기 */
  async getCompleteRateFromSteam(
    gameId: number,
  ): Promise<ICompletedRateFromSteam[]> {
    try {
      const getRates = (
        await axios.get(
          `http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=${gameId}`,
        )
      ).data.achievementpercentages.achievements;

      return getRates;
    } catch (error) {
      throw new ServiceUnavailableException(
        '스팀 도전과제 달성률 api요청 실패',
      );
    }
  }
}
