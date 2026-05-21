export interface Nutrition {
  protein: number;      // 단백질 (g)
  carbs: number;        // 탄수화물 (g)
  fat: number;          // 지방 (g)
}

export interface Meal {
  id: string;
  schoolName: string;   // 씨마스고등학교로 지정
  date: string;         // '5월 15일 금요일' 과 같은 한국 표시용 날짜
  dateKey: string;      // YYYYMMDD
  dayOfWeek: string;    // '월', '화', '수', '목', '금', '토', '일'
  mealType: '중식' | '석식';
  title: string;        // 대표 급식명 (예: 치즈돈까스 정식, 혼합잡곡밥)
  dishes: string[];     // 반찬 목록
  totalCalories: number;// 칼로리 수치 (예: 845)
  nutrition: Nutrition; // 영양성분
  allergens: string[];  // 알레르기 유발 식품 리스트
  proteinAchievement?: number; // 단백질 달성도 (식단표 화면에 표시용, 예: 85)
}

export interface Profile {
  name: string;
  grade: number;
  classNum: number;
  allergens: string[];
  targetCalories: number;
}
