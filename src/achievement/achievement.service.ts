import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Repository } from 'typeorm';
import { Achievement } from './entities/achievement.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  IAchieveUserStat,
  ICompletedRateFromSteam,
} from './type/steam.api.type';
@Injectable()
export class AchievementService {
  constructor(
    @InjectRepository(Achievement)
    private readonly achievementRepository: Repository<Achievement>,
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
    return result;
  }

  /** 해당 게임 도전과제 메타 데이터 db에 저장 */
  async initSaveAchievement(gameId: number) {
    const totalAchievement = (
      await axios.get(
        `http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?appid=${gameId}&key=${process.env.STEAM_API_KEY}&l=koreana`,
      )
    ).data.game.availableGameStats.achievements;
    /** 저장할 도전과제 데이터 청크 */
    const achieveChunk: Achievement[] = [];
    for (const achievement of totalAchievement) {
      const newAchievement = new Achievement();
      newAchievement.description = achievement.description;
      newAchievement.displayName = achievement.displayName;
      newAchievement.game_id = gameId;
      newAchievement.icon = achievement.icon;
      newAchievement.icon_gray = achievement.icongray;
      newAchievement.name = achievement.name;

      achieveChunk.push(newAchievement);
    }

    const savedAchieves = await this.achievementRepository.save(achieveChunk);
    return savedAchieves;
  }

  /** db에 저장된 도전과제의 달성률 업데이트 */
  async updateAchievementCompletionRates(
    achieves: Achievement[],
    curCompleteRate: ICompletedRateFromSteam[],
  ) {
    const map = new Map<string, ICompletedRateFromSteam>();
    for (const rate of curCompleteRate) {
      map.set(rate.name, rate);
    }
    /** 업데이트할 도전과제 데이터 청크 */
    const updatedChunk: Achievement[] = [];
    for (const achievement of achieves) {
      achievement.completed_rate = map.get(achievement.name).percent;
      updatedChunk.push(achievement);
    }
    const updated = await this.achievementRepository.save(updatedChunk);
    return updated;
  }

  /** 유저 데이터 가져와서 각 도전과제 달성 여부 합치기 */
  async getAllAchievementAboutUser(gameId: number, steamId: string) {
    const [userStats, allAchievements] = await Promise.all([
      this.getUserAchievementFromSteam(gameId, steamId),
      this.achievementRepository.find({
        where: { game_id: gameId },
      }),
    ]);

    const userAchievementsMap = new Map<string, IAchieveUserStat>();
    for (const userStat of userStats) {
      userAchievementsMap.set(userStat.apiname, userStat);
    }
    const achievements = allAchievements.map((achieve) => ({
      id: achieve.id,
      displayName: achieve.displayName,
      description: achieve.description,
      achieved: userAchievementsMap.get(achieve.name).achieved,
      img:
        userAchievementsMap.get(achieve.name).achieved === 0
          ? achieve.icon_gray
          : achieve.icon,
      completedRate: achieve.completed_rate,
    }));
    return achievements;
  }

  //---------------------- 스팀 api 요청 -----------------------

  /** 스팀에서 유저 도전과제 진행상태 가져오기 */
  async getUserAchievementFromSteam(gameId: number, steamId: string) {
    const statusUserAchievements = (
      await axios.get(
        `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${gameId}&key=${process.env.STEAM_API_KEY}&steamid=${steamId}`,
      )
    ).data.playerstats.achievements;

    return statusUserAchievements;
  }

  /** 도전과제 달성률 가져오기 */
  async getCompleteRateFromSteam(
    gameId: number,
  ): Promise<ICompletedRateFromSteam[]> {
    const getRates = (
      await axios.get(
        `http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=${gameId}`,
      )
    ).data.achievementpercentages.achievements;

    return getRates;
  }
}
