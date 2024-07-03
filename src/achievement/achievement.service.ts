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

  // async getAchievement() {
  //   const { data } = await axios.get(
  //     'https://api.steampowered.com/ISteamUserStats/GetGlobalStatsForGame/v1/?appid=578080&name[0]=ACHIVE001',
  //   );
  //   console.log(data);
  //   return data;
  // }
}
