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

  async fetchAchievement(gameId: string) {
    /** 해당 게임 도전과제 전부 가져오기 */
    const totalAchievement = (
      await axios.get(
        `http://api.steampowered.com/ISteamUserStats/GetSchemaForGame/v2/?appid=${gameId}&key=${process.env.STEAM_API_KEY}&l=koreana`,
      )
    ).data.game.availableGameStats.achievements;
    /**해당 게임 도전과제 달성률 가져오기 */
    const showRates = (
      await axios.get(
        `http://api.steampowered.com/ISteamUserStats/GetGlobalAchievementPercentagesForApp/v2/?gameid=${gameId}`,
      )
    ).data.achievementpercentages.achievements;

    /** 달성률 맵 */
    const rateHashMap = new Map<string, { name: string; percent: number }>();
    for (const rate of showRates) {
      rateHashMap.set(rate.name, rate);
    }

    const gameAchievement = await this.achievementRepository.find({
      where: { game_id: +gameId },
    });

    /** db에 저장된 도전과제 맵 */
    const dbAchievementMap = new Map<string, Achievement>();
    for (const achievement of gameAchievement) {
      dbAchievementMap.set(achievement.name, achievement);
    }
    const updateAchievement: Achievement[] = [];
    const newAchievements: Achievement[] = [];

    for (const steamAchievement of totalAchievement) {
      const exist = dbAchievementMap.get(steamAchievement.name);
      if (!exist) {
        const newAchievement = new Achievement();
        newAchievement.description = steamAchievement.description;
        newAchievement.displayName = steamAchievement.displayName;
        newAchievement.game_id = parseInt(gameId);
        newAchievement.icon = steamAchievement.icon;
        newAchievement.icon_gray = steamAchievement.icongray;
        newAchievement.name = steamAchievement.name;
        newAchievement.completed_rate = rateHashMap.get(
          newAchievement.name,
        ).percent;

        newAchievements.push(newAchievement);
      } else {
        exist.completed_rate = rateHashMap.get(exist.name).percent;
        updateAchievement.push(exist);
      }
    }
    if (newAchievements.length > 0) {
      await this.achievementRepository.save(newAchievements);
    }

    if (updateAchievement.length > 0) {
      await this.achievementRepository.save(updateAchievement);
    }

    return true;
  }

  // async getAchievement() {
  //   const { data } = await axios.get(
  //     'https://api.steampowered.com/ISteamUserStats/GetGlobalStatsForGame/v1/?appid=578080&name[0]=ACHIVE001',
  //   );
  //   console.log(data);
  //   return data;
  // }
}
