import { Meal, Profile } from '../types';
import { getWeekDates, formatDateKey, formatKoreanDate, getKoreanDayOfWeek } from '../utils/dateUtils';

// 핫링크 급식 메인 이미지 (치즈돈까스 핫링크)
export const HERO_IMAGE_URL = "https://lh3.googleusercontent.com/aida-public/AB6AXuCLxbbPCoBGbJa1tAaxzisgD5Rkk9lkkD-PmjBF3wmeE4LU46YfNgtJJcntvRU2Glwgj0akiAt71I_tTYEeNayU-Enklg0MOb1_Rm1e-sR7g7rPw2lLPwLaqZ42q862Hy8Zh635su9hHu6CZmhckUk9pTeaUb7xmGEyQSainY9S54Z5d7BxsVL5n8uGC2xbbAQpApghVXJ1OMpThEZ_jdDBGqaKpenMS8kMB7brT0AjneHetcEteMqmvYJ79m7aSswZsIitODUlA18";

/**
 * 주어진 기준 날짜를 기반으로 해당 주의 월요일~금요일 식단 데이터를 동적으로 생성합니다.
 * schoolName 은 고정으로 "씨마스고등학교" 입니다.
 */
export function generateMockMealsForWeek(referenceDate: Date): Meal[] {
  const weekDates = getWeekDates(referenceDate);
  const meals: Meal[] = [];

  // 5가지 식단 프로파일 정의
  const mealProfiles = [
    // 월요일 (1번째 날)
    {
      lunch: {
        title: "수제돈가스 정식",
        dishes: ["현미밥", "가쓰오우동", "수제 등심돈가스", "양배추샐러드", "배추김치", "요구르트"],
        totalCalories: 830,
        nutrition: { protein: 30, carbs: 110, fat: 22 },
        allergens: ["대두", "밀", "돼지고기", "우유"],
        proteinAchievement: 80
      },
      dinner: {
        title: "차슈덮밥",
        dishes: ["차슈덮밥", "미소장국", "새콤달콤 해물떡볶이", "아삭부추겉절이", "단무지", "파인애플주스"],
        totalCalories: 710,
        nutrition: { protein: 24, carbs: 90, fat: 18 },
        allergens: ["대두", "밀", "돼지고기", "조개류"],
        proteinAchievement: 65
      }
    },
    // 화요일 (2번째 날)
    {
      lunch: {
        title: "소불고기 덮밥",
        dishes: ["백미밥", "시원한소고기무국", "전통 매콤 소불고기", "매운 두부조림", "아삭 오이무침", "깍두기"],
        totalCalories: 810,
        nutrition: { protein: 32, carbs: 105, fat: 20 },
        allergens: ["대두", "밀", "쇠고기"],
        proteinAchievement: 85
      },
      dinner: {
        title: "치킨마요덮밥",
        dishes: ["치킨마요덮밥", "김치콩나물국", "추억의 소시지야채볶음", "알록달록 오이피클", "배추김치", "유기농 사과주스"],
        totalCalories: 730,
        nutrition: { protein: 25, carbs: 92, fat: 19 },
        allergens: ["난류", "우유", "대두", "밀", "닭고기"],
        proteinAchievement: 68
      }
    },
    // 수요일 (3번째 날) - 식단표 캡처 이미지 내용 매핑
    {
      lunch: {
        title: "혼합잡곡밥",
        dishes: ["혼합잡곡밥", "보글보글 돈육김치찌개", "두툼한 수제함박스테이크", "영양 숙주미나리무침", "깍두기", "콘드레싱 샐러드"],
        totalCalories: 850,
        nutrition: { protein: 28, carbs: 115, fat: 24 },
        allergens: ["돼지고기", "쇠고기", "대두", "밀"],
        proteinAchievement: 85
      },
      dinner: {
        title: "참치마요덮밥",
        dishes: ["참치마요덮밥", "따끈한 미니우동", "새콤 단무지무침", "배추김치", "요구르트"],
        totalCalories: 720,
        nutrition: { protein: 20, carbs: 98, fat: 21 },
        allergens: ["난류", "우유", "대두", "밀"],
        proteinAchievement: 60
      }
    },
    // 목요일 (4번째 날) - 홈 캡처 이미지 내용 매핑
    {
      lunch: {
        title: "치즈돈까스 정식",
        dishes: ["친환경현미밥", "쇠고기미역국", "바삭한 매콤돈육강정", "숙주미나리무침", "배추김치"],
        totalCalories: 845,
        nutrition: { protein: 32, carbs: 110, fat: 25 },
        allergens: ["대두", "밀", "쇠고기", "돼지고기"],
        proteinAchievement: 85
      },
      dinner: {
        title: "불닭치즈덮밥",
        dishes: ["불닭치즈덮밥", "담백한 계란파국", "노릇한 감자채볶음", "시원한 백김치", "유기농 포도즙"],
        totalCalories: 750,
        nutrition: { protein: 28, carbs: 100, fat: 23 },
        allergens: ["난류", "대두", "밀", "닭고기", "우유"],
        proteinAchievement: 75
      }
    },
    // 금요일 (5번째 날)
    {
      lunch: {
        title: "매콤 낙지비빔밥",
        dishes: ["현미밥", "감칠맛 유부장국", "매콤 야채낙지비빔밥", "노랑 바삭 야채튀김", "부드러운 푸딩 계란찜", "열무김치"],
        totalCalories: 780,
        nutrition: { protein: 26, carbs: 112, fat: 16 },
        allergens: ["난류", "밀", "대두", "조개류"],
        proteinAchievement: 72
      },
      dinner: {
        title: "돼지국밥 정식",
        dishes: ["보슬보슬 흰쌀밥", "깊고 진한 돼지국밥", "쫄깃한 소면사리", "부추오이무침", "고추쌈장무침", "섞박지", "달콤한 초코컵케이크"],
        totalCalories: 740,
        nutrition: { protein: 29, carbs: 94, fat: 20 },
        allergens: ["대두", "밀", "돼지고기", "우유"],
        proteinAchievement: 78
      }
    }
  ];

  weekDates.forEach((date, index) => {
    const profile = mealProfiles[index] || mealProfiles[3]; // 범위 오버플로우 방지용 백업
    const dateKey = formatDateKey(date);
    const dayName = getKoreanDayOfWeek(date);

    // Lunch 추가
    meals.push({
      id: `${dateKey}-lunch`,
      schoolName: "씨마스고등학교",
      date: formatKoreanDate(date),
      dateKey,
      dayOfWeek: dayName,
      mealType: "중식",
      title: profile.lunch.title,
      dishes: profile.lunch.dishes,
      totalCalories: profile.lunch.totalCalories,
      nutrition: profile.lunch.nutrition,
      allergens: profile.lunch.allergens,
      proteinAchievement: profile.lunch.proteinAchievement
    });

    // Dinner 추가
    meals.push({
      id: `${dateKey}-dinner`,
      schoolName: "씨마스고등학교",
      date: formatKoreanDate(date),
      dateKey,
      dayOfWeek: dayName,
      mealType: "석식",
      title: profile.dinner.title,
      dishes: profile.dinner.dishes,
      totalCalories: profile.dinner.totalCalories,
      nutrition: profile.dinner.nutrition,
      allergens: profile.dinner.allergens,
      proteinAchievement: profile.dinner.proteinAchievement
    });
  });

  return meals;
}

// 기본 프로필 상태값 정의
export const DEFAULT_PROFILE: Profile = {
  name: "김영희",
  grade: 2,
  classNum: 3,
  allergens: ["돼지고기", "대두"],
  targetCalories: 2400
};
