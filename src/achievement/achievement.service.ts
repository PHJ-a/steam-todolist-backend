import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { Repository } from 'typeorm';
import { Achievement } from './entities/achievement.entity';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class AchievementService {
  constructor(
    @InjectRepository(Achievement)
    private readonly achievementRepository: Repository<Achievement>,
  ) {}

  async fetchAchievement(gameId: number) {
    const gameAchievement = await this.achievementRepository.find({
      where: { game_id: gameId },
    });
    // 도전과제 이미 db에 있으면 완료율만 업데이트
    if (gameAchievement.length !== 0) {
      const update = await this.fetchCompletedRate(gameId);
      return update;
    } else {
      // 없으면 도전과제 저장 & 완료율 업데이트
      const initSave = await this.initSaveAchievement(gameId);
      await this.fetchCompletedRate(gameId);
      return initSave;
    }
  }
  /** 처음 도전과제 전부 저장 */
  async initSaveAchievement(gameId: number) {
    const totalAchievement = (
      await axios.get(
        `http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?appid=${gameId}&key=${process.env.STEAM_API_KEY}&l=koreana`,
      )
    ).data.game.availableGameStats.achievements;
    for (const achievement of totalAchievement) {
      const newAchievement = new Achievement();
      newAchievement.description = achievement.description;
      newAchievement.displayName = achievement.displayName;
      newAchievement.game_id = gameId;
      newAchievement.icon = achievement.icon;
      newAchievement.icon_gray = achievement.icongray;
      newAchievement.name = achievement.name;

      await this.achievementRepository.save(newAchievement);
    }
    return { msg: 'init saved' };
  }

  /** 도전과제 완료율 가져오기 */
  async fetchCompletedRate(gameId: number) {
    const showRates = (
      await axios.get(
        `http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=${gameId}`,
      )
    ).data.achievementpercentages.achievements;

    const achievements = await this.achievementRepository.find({
      where: { game_id: gameId },
    });

    const map = new Map<string, { name: string; percent: number }>();
    for (const rate of showRates) {
      map.set(rate.name, rate);
    }
    for (const achievement of achievements) {
      achievement.completed_rate = map.get(achievement.name).percent;
      await this.achievementRepository.save(achievement);
    }
    return { msg: 'update rate' };
  }

  /** 도전과제 응답에 필요한 데이터로 변환하기 */
  async getAllAchievementAboutUser(gameId: number, steamId: string) {
    const [userStats, allAchievements] = await Promise.all([
      this.getUserAchievementFrom(gameId, steamId),
      this.achievementRepository.find({
        where: { game_id: gameId },
      }),
    ]);

    const map = new Map<
      string,
      { apiname: string; achieved: number; unlocktime: Date }
    >();
    for (const userStat of userStats) {
      map.set(userStat.apiname, userStat);
    }
    const achievements = allAchievements.map((a) => ({
      displayName: a.displayName,
      description: a.description,
      achieved: map.get(a.name).achieved,
      end: map.get(a.name).unlocktime,
      img: map.get(a.name).achieved === 0 ? a.icon_gray : a.icon,
      completedRate: a.completed_rate,
    }));
    return { achievements, gameId };
  }

  /** 스팀에서 유저 도전과제 진행상태 가져오기 */
  async getUserAchievementFrom(gameId: number, steamId: string) {
    const statusUserAchievements = (
      await axios.get(
        `https://api.steampowered.com/ISteamUserStats/GetPlayerAchievements/v0001/?appid=${gameId}&key=${process.env.STEAM_API_KEY}&steamid=${steamId}`,
      )
    ).data.playerstats.achievements;

    return statusUserAchievements;
  }
}
