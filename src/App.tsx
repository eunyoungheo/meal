/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Utensils, 
  Bell, 
  ChevronLeft, 
  ChevronRight, 
  Sun, 
  Moon, 
  AlertTriangle, 
  Flame, 
  CheckCircle2, 
  Circle, 
  Home as HomeIcon, 
  CalendarDays, 
  Calculator, 
  User as UserIcon,
  Sparkles,
  Search,
  Plus,
  BookmarkCheck,
  Check,
  RotateCcw,
  BadgeAlert
} from 'lucide-react';

import { Meal, Profile, Nutrition } from './types';
import { 
  getTodayKST, 
  formatKoreanDate, 
  formatDateKey, 
  getWeekDates, 
  getWeekOfMonth, 
  getDefaultSelectedDate, 
  getKoreanDayOfWeek, 
  isWeekend 
} from './utils/dateUtils';
import { generateMockMealsForWeek, DEFAULT_PROFILE, HERO_IMAGE_URL } from './data/mockMeals';

// 영양계산 탭용 식자재 영양 보정 헬퍼
interface InteractiveIngredient {
  id: string;
  name: string;
  category: 'rice' | 'soup' | 'side' | 'dessert';
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  badge: string;
}

export default function App() {
  // ---- 1. Dates and States Initialization ----
  const today = useMemo(() => getTodayKST(), []);
  
  // 기본 선택 일자 구하기 (오늘이 주말이면 다음 월요일)
  const initialSelectedDate = useMemo(() => getDefaultSelectedDate(today), [today]);
  
  // 현재 조회 식단 날짜 상태
  const [selectedDate, setSelectedDate] = useState<Date>(initialSelectedDate);
  // 활성화 탭 상태
  const [currentTab, setCurrentTab] = useState<'home' | 'schedule' | 'nutrition' | 'profile'>('home');
  // 알림 보관용 토스트
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // 식단 리스트 상태 (오늘 기준 전체 주의 식단)
  const meals: Meal[] = useMemo(() => {
    return generateMockMealsForWeek(today);
  }, [today]);

  // 프로필 상태
  const [profile, setProfile] = useState<Profile>(DEFAULT_PROFILE);

  // ---- 2. Weekend Auto Badge Detection ----
  const displayingWeekendFallback = isWeekend(today);

  // ---- 3. Date Navigation Handlers ----
  const handlePrevDay = () => {
    const prev = new Date(selectedDate);
    prev.setDate(selectedDate.getDate() - 1);
    setSelectedDate(prev);
  };

  const handleNextDay = () => {
    const next = new Date(selectedDate);
    next.setDate(selectedDate.getDate() + 1);
    setSelectedDate(next);
  };

  const handleGoToToday = () => {
    setSelectedDate(initialSelectedDate);
    showToast("🕒 기준 급식일로 자동 이동했습니다.");
  };

  // ---- 4. Intermediary Meal Parsing for Selected Date ----
  const dateKey = formatDateKey(selectedDate);
  
  const dailyMeals = useMemo(() => {
    return meals.filter(m => m.dateKey === dateKey);
  }, [meals, dateKey]);

  const lunchMeal = useMemo(() => dailyMeals.find(m => m.mealType === '중식'), [dailyMeals]);
  const dinnerMeal = useMemo(() => dailyMeals.find(m => m.mealType === '석식'), [dailyMeals]);

  // 선택된 날짜의 주차 정보 계산 (예: "5월 3주차")
  const weekInfoStr = useMemo(() => {
    const { month, week } = getWeekOfMonth(selectedDate);
    return `${month}월 ${week}주차`;
  }, [selectedDate]);

  // ---- 5. Toast Notification Utility ----
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // ---- 6. Advanced Interactive Nutrition Calculator Handling ----
  // 선택한 날짜의 점심 메뉴를 세부 식자재로 쪼개기
  const interactiveIngredients = useMemo<InteractiveIngredient[]>(() => {
    const currentLunch = lunchMeal || { title: "혼합잡곡밥", dishes: ["혼합잡곡밥", "김치찌개"] };
    const items = currentLunch.dishes || [];
    
    // 단순 반찬명 매치 맵핑
    return items.map((dish, i) => {
      let category: 'rice' | 'soup' | 'side' | 'dessert' = 'side';
      let calories = 120;
      let protein = 6;
      let carbs = 25;
      let fat = 2;
      let badge = "신선 식재료";

      const name = dish.trim();

      // 국류 판정
      if (name.includes('국') || name.includes('찌개') || name.includes('스프') || name.includes('탕')) {
        category = 'soup';
        calories = 140;
        protein = 9;
        carbs = 12;
        fat = 6;
        badge = "고칼슘/방풍";
      }
      // 밥류 판정
      else if (name.includes('밥') || name.includes('덮밥')) {
        category = 'rice';
        calories = 310;
        protein = 7;
        carbs = 68;
        fat = 1.5;
        badge = "국산 친환경 곡물";
      }
      // 디저트/음료 과일 판정
      else if (name.includes('요구르트') || name.includes('주스') || name.includes('즙') || name.includes('수박') || name.includes('케이크')) {
        category = 'dessert';
        calories = 65;
        protein = 1.5;
        carbs = 15;
        fat = 0.5;
        badge = "달콤 오가닉 디저트";
      }
      // 일반 육류 반찬 판정
      else if (name.includes('돈까스') || name.includes('돈가스') || name.includes('강정') || name.includes('불고기') || name.includes('스테이크')) {
        category = 'side';
        calories = 280;
        protein = 18;
        carbs = 15;
        fat = 14;
        badge = "풍부한 단백질원";
      }
      // 일반 소형 반찬/김치 완충
      else if (name.includes('김치') || name.includes('무침') || name.includes('깍두기') || name.includes('나물') || name.includes('샐러드')) {
        category = 'side';
        calories = 35;
        protein = 2;
        carbs = 6;
        fat = 0.2;
        badge = "비타민/무기질";
      }

      return {
        id: `ing-${dateKey}-${i}`,
        name,
        category,
        calories,
        protein,
        carbs,
        fat,
        badge
      };
    });
  }, [lunchMeal, dateKey]);

  // 사용자에 의해 체크된 식자재 상태 관리
  const [selectedIngredientIds, setSelectedIngredientIds] = useState<string[]>([]);
  const [nutritionFilter, setNutritionFilter] = useState<'all' | 'rice' | 'soup' | 'side' | 'dessert'>('all');

  // 날짜 바뀔 때마다 영양계산 체크박스 전체 자동선택(초기 세팅) 처리
  useEffect(() => {
    setSelectedIngredientIds(interactiveIngredients.map(item => item.id));
  }, [interactiveIngredients]);

  // 영양 성분 실시간 동적 합산
  const dynamicTotals = useMemo(() => {
    let kcal = 0;
    let prot = 0;
    let carb = 0;
    let ft = 0;

    interactiveIngredients.forEach(ing => {
      if (selectedIngredientIds.includes(ing.id)) {
        kcal += ing.calories;
        prot += ing.protein;
        carb += ing.carbs;
        ft += ing.fat;
      }
    });

    return { kcal, prot, carb, ft };
  }, [interactiveIngredients, selectedIngredientIds]);

  const handleToggleIngredient = (id: string) => {
    if (selectedIngredientIds.includes(id)) {
      setSelectedIngredientIds(selectedIngredientIds.filter(x => x !== id));
    } else {
      setSelectedIngredientIds([...selectedIngredientIds, id]);
    }
  };

  const handleResetNutritionSelection = () => {
    setSelectedIngredientIds(interactiveIngredients.map(item => item.id));
    showToast("🔄 모든 점식 식사 메뉴를 다시 선택했습니다.");
  };

  const handleSaveNutritionResult = () => {
    showToast(`💾 오늘의 한 끼 영양 (${dynamicTotals.kcal} kcal)이 건강 다이어리에 기록되었습니다.`);
  };

  // 프로필 입출력 핸들러
  const [profileInput, setProfileInput] = useState(profile);
  const handleSaveProfile = (e: FormEvent) => {
    e.preventDefault();
    setProfile(profileInput);
    showToast("💚 영양 타겟 프로필이 성공적으로 저장되었습니다.");
  };

  return (
    <div className="w-full max-w-[420px] bg-surface shadow-xl min-h-screen relative pb-[100px] mx-auto flex flex-col justify-between overflow-x-hidden">
      
      {/* GLobal Toast Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 16, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="absolute top-4 left-4 right-4 z-[9999] bg-primary text-on-primary rounded-xl px-4 py-3 shadow-lg flex items-center gap-2 border border-primary-container"
          >
            <Sparkles className="w-5 h-5 text-on-primary-container" />
            <span className="text-sm font-medium font-sans leading-tight">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- APP HEADER --- */}
      <header className="flex justify-between items-center w-full px-6 py-4 bg-background z-50 sticky top-0 border-b border-surface-container-high shadow-sm">
        <button 
          onClick={handleGoToToday}
          className="hover:opacity-80 transition-opacity active:scale-95 text-primary flex items-center gap-1 cursor-pointer"
          title="오늘 날짜로 이동"
        >
          <Utensils className="w-6 h-6" />
        </button>
        <h1 className="font-sans text-lg font-bold text-primary-container tracking-tight">씨마스고등학교 급식</h1>
        <button 
          onClick={() => showToast("🔔 알림: 오늘 급식이 위생적이고 맛있게 조리되었습니다!")}
          className="hover:opacity-80 transition-opacity active:scale-95 text-on-surface-variant cursor-pointer"
        >
          <Bell className="w-6 h-6" />
        </button>
      </header>

      {/* --- MAIN TABS FRAME --- */}
      <main className="px-6 pb-8 pt-4 flex-1 flex flex-col gap-6">
        
        {/* TAB 1: HOME SHEET */}
        {currentTab === 'home' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Ambient Date Selector Card */}
            <section className="flex items-center justify-between bg-surface-container rounded-2xl p-4 shadow-[0_4px_20px_0_rgba(60,85,0,0.04)]">
              <button 
                onClick={handlePrevDay}
                className="text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <div className="text-center flex flex-col items-center">
                <span className="text-xs font-semibold text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded mb-1">
                  {selectedDate.getFullYear()}년
                </span>
                <h2 className="text-lg font-bold text-primary">
                  {formatKoreanDate(selectedDate)}
                </h2>
              </div>
              <button 
                onClick={handleNextDay}
                className="text-on-surface-variant p-2 hover:bg-surface-container-high rounded-full transition-colors cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </section>

            {/* Weekend Check Alert Header */}
            {displayingWeekendFallback && (
              <div className="bg-secondary-container text-on-secondary-container rounded-xl p-3 flex items-start gap-2.5 shadow-[0_2px_8px_rgba(0,0,0,0.05)] border border-outline/10">
                <BadgeAlert className="w-5 h-5 mt-0.5 shrink-0 text-primary" />
                <div className="flex-1">
                  <p className="text-xs font-bold font-sans">
                    오늘은 아늑한 주말입니다 🏡
                  </p>
                  <p className="text-[11px] opacity-90 font-sans mt-0.5 leading-tight">
                    가장 가까운 예정 급식일인 다음 월요일 식단의 정보를 자동으로 전환하여 제공해 드리고 있습니다.
                  </p>
                </div>
                <span className="bg-primary text-on-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full select-none whitespace-nowrap animate-pulse">
                  다음 급식일
                </span>
              </div>
            )}

            {/* Hero Main Feature Card */}
            {lunchMeal && (
              <div className="bg-surface-container-lowest rounded-[24px] overflow-hidden shadow-[0_4px_20px_0_rgba(60,85,0,0.04)] ring-1 ring-[#EEF0EA] relative group">
                <div className="h-[210px] w-full bg-surface-container-high relative">
                  <img 
                    alt="Cheese Pork Cutlet Recommended Menu" 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    src={HERO_IMAGE_URL}
                  />
                  <div className="absolute top-4 left-4 bg-primary text-on-primary text-xs font-bold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-on-primary-container" />
                    오늘의 추천 급식
                  </div>
                  <button 
                    onClick={() => showToast("❤️ 이메뉴를 찜했습니다! 식단 기호도에 반영됩니다.")}
                    className="absolute top-4 right-4 bg-surface-container-lowest/90 backdrop-blur-sm p-2 rounded-full text-error hover:scale-110 active:scale-95 transition-transform shadow"
                  >
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  </button>
                </div>
                <div className="p-5 bg-surface-container-lowest">
                  <div className="flex justify-between items-end mb-1">
                    <h3 className="text-xl font-bold text-on-surface font-sans">
                      {lunchMeal.title}
                    </h3>
                    <div className="bg-secondary-container text-on-secondary-container text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 shadow-sm">
                      <Flame className="w-3 h-3 text-primary" />
                      {lunchMeal.totalCalories} kcal
                    </div>
                  </div>
                  <p className="text-xs text-on-surface-variant font-sans opacity-95">
                    식재료 엄선과 친환경 조리로 완성한 씨마스코 대표 메인 정식
                  </p>
                </div>
              </div>
            )}

            {/* Lunch Card */}
            {lunchMeal ? (
              <div className="bg-surface-container-lowest rounded-[24px] p-6 shadow-[0_4px_20px_0_rgba(60,85,0,0.04)] ring-1 ring-[#EEF0EA] flex flex-col gap-4 border-l-4 border-primary">
                <div className="flex justify-between items-center border-b border-surface-container-highest pb-3">
                  <div className="flex items-center gap-2">
                    <Sun className="w-5 h-5 text-primary" />
                    <h4 className="text-base font-bold text-primary font-sans">중식 식단</h4>
                  </div>
                  <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
                    {lunchMeal.totalCalories} kcal
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                    대표: {lunchMeal.title}
                  </div>
                  <div className="pl-3 py-1 bg-surface-container-low rounded-lg">
                    <p className="text-xs text-on-surface-variant leading-relaxed font-sans font-medium">
                      {lunchMeal.dishes.join(', ')}
                    </p>
                  </div>
                </div>

                {lunchMeal.allergens && lunchMeal.allergens.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1.5 border-t border-surface-container-high">
                    <span className="bg-surface-container text-on-surface-variant text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      알레르기: {lunchMeal.allergens.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-surface-container rounded-[24px] p-6 text-center text-on-surface-variant text-sm">
                해당 날짜 주간 급식이 수립되지 않았습니다.
              </div>
            )}

            {/* Dinner Card */}
            {dinnerMeal ? (
              <div className="bg-surface-container-lowest rounded-[24px] p-6 shadow-[0_4px_20px_0_rgba(60,85,0,0.04)] ring-1 ring-[#EEF0EA] flex flex-col gap-4 border-l-4 border-secondary">
                <div className="flex justify-between items-center border-b border-surface-container-highest pb-3">
                  <div className="flex items-center gap-2">
                    <Moon className="w-5 h-5 text-secondary" />
                    <h4 className="text-base font-bold text-secondary font-sans font-sans">석식 식단</h4>
                  </div>
                  <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-3 py-1 rounded-full">
                    {dinnerMeal.totalCalories} kcal
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                    대표: {dinnerMeal.title}
                  </div>
                  <div className="pl-3 py-1 bg-surface-container-low rounded-lg">
                    <p className="text-xs text-on-surface-variant leading-relaxed font-sans font-medium">
                      {dinnerMeal.dishes.join(', ')}
                    </p>
                  </div>
                </div>

                {dinnerMeal.allergens && dinnerMeal.allergens.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1.5 border-t border-surface-container-high">
                    <span className="bg-surface-container text-on-surface-variant text-[11px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-amber-600" />
                      알레르기: {dinnerMeal.allergens.join(', ')}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-surface-container rounded-[24px] p-6 text-center text-on-surface-variant text-sm">
                저녁 식사 예정이 없습니다. 야간 보충 또는 하교 일정에 해당합니다.
              </div>
            )}

            {/* Combined Nutrition Indicator Card */}
            {lunchMeal && dinnerMeal && (
              <div className="bg-surface-container-low rounded-2xl p-4 flex justify-between items-center ring-1 ring-outline/5 text-xs font-semibold">
                <span className="text-on-surface-variant">🍱 오늘 중/석식 총 영양합</span>
                <span className="text-primary font-bold">
                  {lunchMeal.totalCalories + dinnerMeal.totalCalories} kcal
                </span>
              </div>
            )}

          </motion.div>
        )}

        {/* TAB 2: SCHEDULE WEEKLY VIEW */}
        {currentTab === 'schedule' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Header Description */}
            <section className="flex flex-col gap-1">
              <span className="text-xs font-bold text-secondary uppercase tracking-widest">주간 한눈에 보기</span>
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-on-surface">{weekInfoStr}</h2>
                <button 
                  onClick={handleGoToToday}
                  className="p-2 bg-surface-container rounded-full text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
                  title="기준일 이동"
                >
                  <CalendarDays className="w-5 h-5" />
                </button>
              </div>
            </section>

            {/* Beautiful KST dynamic week picker */}
            <section className="flex justify-between items-center bg-surface-container-low rounded-2xl p-2 shadow-[0_4px_20px_0_rgba(60,85,0,0.04)]">
              {getWeekDates(selectedDate).map((dateVal, i) => {
                const dayName = getKoreanDayOfWeek(dateVal);
                const dayNumString = String(dateVal.getDate());
                const isSelected = formatDateKey(dateVal) === formatDateKey(selectedDate);
                const isRealToday = formatDateKey(dateVal) === formatDateKey(today);

                return (
                  <button
                    key={`schedule-day-${i}`}
                    onClick={() => setSelectedDate(dateVal)}
                    className={`flex flex-col items-center justify-center py-2 px-3.5 rounded-xl transition-all cursor-pointer relative ${
                      isSelected 
                        ? "bg-primary text-on-primary font-bold shadow-md scale-105" 
                        : "text-on-surface-variant hover:bg-surface-container transition-colors"
                    }`}
                  >
                    <span className="text-[11px] opacity-80 mb-0.5">{dayName}</span>
                    <span className="text-base font-bold">{dayNumString}</span>
                    
                    {/* Real today small light dot indicator */}
                    {isRealToday && (
                      <span className={`absolute bottom-1 w-1 h-1 rounded-full ${isSelected ? "bg-on-primary-container" : "bg-primary"}`} />
                    )}
                  </button>
                );
              })}
            </section>

            {/* List of Meals of the selected day */}
            <div className="flex flex-col gap-6">
              {/* Selected Day KST Formatted Text */}
              <div className="text-xs font-bold text-on-surface-variant bg-surface-container-high px-3.5 py-1.5 rounded-lg inline-block w-fit">
                🔍 선택한 날짜: <span className="text-primary">{formatKoreanDate(selectedDate)}</span>
              </div>

              {lunchMeal && (
                <article className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_20px_0_rgba(60,85,0,0.04)] flex flex-col gap-4 border border-outline-variant/30 relative overflow-hidden group">
                  <header className="flex justify-between items-start border-b border-surface-variant pb-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-secondary mb-1">식단표 - 중식</span>
                      <h3 className="text-lg font-bold text-on-surface leading-tight font-sans">
                        {lunchMeal.title}
                      </h3>
                    </div>
                    <div className="bg-secondary-container text-on-secondary-container px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold">
                      <Flame className="w-3.5 h-3.5 text-primary" />
                      <span>{lunchMeal.totalCalories} kcal</span>
                    </div>
                  </header>

                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-on-surface-variant leading-relaxed font-sans font-medium">
                      {lunchMeal.dishes.join(' • ')}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {lunchMeal.allergens.map((alg, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-surface-container text-on-surface-variant rounded-full text-[11px] font-semibold border border-outline-variant/50">
                        {alg}
                      </span>
                    ))}
                  </div>

                  {/* Dynamic Protein Target progress */}
                  <div className="mt-2 pt-4 border-t border-surface-variant flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-on-surface-variant">일일 영양 권정 단백질 달성도</span>
                      <span className="text-primary font-bold">
                        {lunchMeal.proteinAchievement || 85}%
                      </span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                      <div 
                        className="bg-primary h-full rounded-full transition-all duration-500" 
                        style={{ width: `${lunchMeal.proteinAchievement || 85}%` }}
                      />
                    </div>
                  </div>
                </article>
              )}

              {dinnerMeal && (
                <article className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_20px_0_rgba(60,85,0,0.04)] flex flex-col gap-4 border border-outline-variant/30 relative overflow-hidden group">
                  <header className="flex justify-between items-start border-b border-surface-variant pb-4">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-secondary mb-1">식단표 - 석식</span>
                      <h3 className="text-lg font-bold text-on-surface leading-tight font-sans font-sans">
                        {dinnerMeal.title}
                      </h3>
                    </div>
                    <div className="bg-surface-container-high text-on-surface px-3 py-1 rounded-full flex items-center gap-1 border border-outline-variant/50 text-xs font-bold">
                      <Flame className="w-3.5 h-3.5 text-secondary" />
                      <span>{dinnerMeal.totalCalories} kcal</span>
                    </div>
                  </header>

                  <div className="flex flex-col gap-2">
                    <p className="text-sm text-on-surface-variant leading-relaxed font-sans font-medium">
                      {dinnerMeal.dishes.join(' • ')}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {dinnerMeal.allergens.map((alg, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-surface-container text-on-surface-variant rounded-full text-[11px] font-semibold border border-outline-variant/30">
                        {alg}
                      </span>
                    ))}
                  </div>

                  {/* Dynamic Protein Target progress */}
                  <div className="mt-2 pt-4 border-t border-surface-variant flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-on-surface-variant">단백질 달성도</span>
                      <span className="text-secondary font-bold">60%</span>
                    </div>
                    <div className="w-full bg-surface-variant rounded-full h-2 overflow-hidden">
                      <div className="bg-secondary h-full rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                </article>
              )}

              {!lunchMeal && !dinnerMeal && (
                <div className="bg-surface-container rounded-2xl p-8 text-center text-on-surface-variant text-sm font-sans">
                  조회한 날은 급식이 등록되지 않은 유휴일입니다.
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* TAB 3: HEALTH NUTRITION CALCULATOR */}
        {currentTab === 'nutrition' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Header Text */}
            <section className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-secondary uppercase tracking-widest">스마트 영양 분석기</span>
              <h2 className="text-2xl font-bold text-on-surface">식단 조합 계산기</h2>
            </section>

            {/* Selected Date Context info */}
            <div className="flex justify-between items-center bg-surface-container-low px-4 py-2 rounded-xl text-xs">
              <span className="text-on-surface-variant font-medium">
                조합 대상: <span className="text-primary font-bold">{lunchMeal?.title || "중식 메뉴"}</span>
              </span>
              <span className="text-[11px] text-[#555] bg-surface-container px-2 py-0.5 rounded">
                기준: {formatKoreanDate(selectedDate)}
              </span>
            </div>

            {/* Real-time Dynamic Integrated Nutrition Summary Card */}
            <section className="bg-surface-container-lowest rounded-[24px] p-6 shadow-[0_4px_20px_0_rgba(60,85,0,0.4)] border border-surface-variant flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <h3 className="text-base font-bold text-on-surface font-sans">선택한 조합 영양</h3>
                <p className="text-[11px] text-on-surface-variant">밥과 찬을 선택/해제해 보며 오늘의 영양 성분을 분석할 수 있습니다.</p>
              </div>

              {/* Mega Total Calories Output */}
              <div className="flex items-end gap-1 mb-2">
                <span className="text-3xl font-bold text-primary leading-none font-sans">
                  {dynamicTotals.kcal}
                </span>
                <span className="text-sm font-medium text-on-surface-variant pb-0.5">kcal</span>
              </div>

              {/* Dynamic Protein Progress Gauge */}
              <div className="flex flex-col gap-3.5">
                {/* Protein */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-on-surface flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary-container" />
                      단백질 (g)
                    </span>
                    <span className="font-semibold text-on-surface-variant">{dynamicTotals.prot}g</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-secondary-container rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, (dynamicTotals.prot / 45) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Carbohydrates */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-on-surface flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                      탄수화물 (g)
                    </span>
                    <span className="font-semibold text-on-surface-variant">{dynamicTotals.carb}g</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary-container rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, (dynamicTotals.carb / 150) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Fat */}
                <div>
                  <div className="flex justify-between items-center text-xs mb-1">
                    <span className="font-bold text-on-surface flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container" />
                      지방 (g)
                    </span>
                    <span className="font-semibold text-on-surface-variant">{dynamicTotals.fat}g</span>
                  </div>
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-tertiary-container rounded-full transition-all duration-300" 
                      style={{ width: `${Math.min(100, (dynamicTotals.fat / 40) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Menu Category Selection Chips */}
            <section className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none -mx-6 px-6">
              {[
                { key: 'all', label: '전체' },
                { key: 'rice', label: '밥류' },
                { key: 'soup', label: '국/찌개' },
                { key: 'side', label: '반찬' },
                { key: 'dessert', label: '디저트' },
              ].map(chip => (
                <button
                  key={chip.key}
                  onClick={() => setNutritionFilter(chip.key as any)}
                  className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-semibold cursor-pointer ${
                    nutritionFilter === chip.key
                      ? "bg-primary text-on-primary font-bold shadow-sm"
                      : "bg-surface-container border border-outline-variant/40 text-on-surface-variant hover:bg-surface-container-high transition-colors"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </section>

            {/* Selectable dynamic ingredient items list */}
            <section className="flex flex-col gap-3">
              {interactiveIngredients
                .filter(ing => nutritionFilter === 'all' || ing.category === nutritionFilter)
                .map((ing) => {
                  const isChecked = selectedIngredientIds.includes(ing.id);

                  return (
                    <label
                      key={ing.id}
                      onClick={() => handleToggleIngredient(ing.id)}
                      className={`relative flex items-center justify-between p-4 rounded-[16px] cursor-pointer transition-all ${
                        isChecked
                          ? "bg-surface-container-low border-2 border-primary"
                          : "bg-surface-container-lowest border border-surface-variant/70 shadow-sm"
                      }`}
                    >
                      <div className="flex flex-col gap-1 pointer-events-none">
                        <span className="text-sm font-bold text-on-surface font-sans">
                          {ing.name}
                        </span>
                        <div className="flex gap-1.5 items-center mt-0.5">
                          <span className="px-2 py-0.5 bg-secondary-container text-on-secondary-container rounded-full text-[10px] font-bold">
                            {ing.calories} kcal
                          </span>
                          <span className="px-2 py-0.5 bg-surface-container-high text-on-surface-variant rounded-full text-[10px] font-medium">
                            단백질 {ing.protein}g · 탄 {ing.carbs}g
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 pointer-events-none">
                        {isChecked ? (
                          <CheckCircle2 className="w-5.5 h-5.5 text-primary" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-outline-variant/60" />
                        )}
                      </div>
                    </label>
                  );
                })}
              
              {interactiveIngredients.filter(ing => nutritionFilter === 'all' || ing.category === nutritionFilter).length === 0 && (
                <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-2xl p-8 text-center text-xs text-on-surface-variant">
                  이 카테고리(필터)에 속한 식단 목록이 비어 있습니다.
                </div>
              )}
            </section>

            {/* Bottom calculation Action Panel */}
            <div className="flex gap-2.5 mt-2">
              <button
                onClick={handleResetNutritionSelection}
                className="px-4 bg-surface-container text-on-surface-variant rounded-[12px] font-bold hover:bg-surface-container-high active:scale-95 transition-all cursor-pointer flex items-center justify-center"
                title="선택 초기화"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
              <button 
                onClick={handleSaveNutritionResult}
                className="flex-1 h-[52px] bg-primary text-on-primary rounded-[12px] font-bold text-sm shadow hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                <BookmarkCheck className="w-5 h-5 text-on-primary-container" />
                계산 결과 저장하기
              </button>
            </div>
          </motion.div>
        )}

        {/* TAB 4: PROFILE & PREFERENCE SETTING */}
        {currentTab === 'profile' && (
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6"
          >
            {/* Header */}
            <section className="flex flex-col gap-1">
              <span className="text-xs font-semibold text-secondary uppercase tracking-widest">씨마스코 멤버 프로필</span>
              <h2 className="text-2xl font-bold text-on-surface">나의 영양 정보 관리</h2>
            </section>

            {/* Interactive User profile setting Form */}
            <div className="bg-surface-container-lowest rounded-3xl p-6 shadow-[0_4px_20px_0_rgba(60,85,0,0.04)] border border-surface-variant/40">
              <form onSubmit={handleSaveProfile} className="space-y-5">
                
                {/* Visual Avatar Badge */}
                <div className="flex items-center gap-4 border-b border-surface-container-high pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary text-on-primary flex items-center justify-center font-bold text-xl uppercase tracking-tighter shadow-sm">
                    {profile.name.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-on-surface font-sans">{profile.name} 학생</h3>
                    <p className="text-xs text-on-surface-variant font-sans">
                      {profile.grade}학년 {profile.classNum}반 · 급식 등록 완료
                    </p>
                  </div>
                </div>

                {/* Input 1: Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-primary">이름</label>
                  <input
                    type="text"
                    required
                    value={profileInput.name}
                    onChange={(e) => setProfileInput({ ...profileInput, name: e.target.value })}
                    className="w-full px-4.5 py-3.5 bg-surface-container rounded-xl text-sm border border-transparent focus:border-primary focus:outline-none transition-all font-sans font-medium text-on-surface"
                  />
                </div>

                {/* Grid container for class/grade */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-primary">학년</label>
                    <select
                      value={profileInput.grade}
                      onChange={(e) => setProfileInput({ ...profileInput, grade: Number(e.target.value) })}
                      className="w-full px-4.5 py-3.5 bg-surface-container rounded-xl text-sm border-none focus:outline-none focus:ring-1 focus:ring-primary font-sans font-medium text-on-surface"
                    >
                      {[1,2,3].map(g => (
                        <option key={g} value={g}>{g}학년</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-primary">학반</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={18}
                      value={profileInput.classNum}
                      onChange={(e) => setProfileInput({ ...profileInput, classNum: Number(e.target.value) })}
                      className="w-full px-4.5 py-3.5 bg-surface-container rounded-xl text-sm border border-transparent focus:border-primary focus:outline-none transition-all font-sans font-medium text-on-surface"
                    />
                  </div>
                </div>

                {/* Target Calories */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-primary">일일 타겟 권장 칼로리 (kcal)</label>
                  <input
                    type="number"
                    min={1200}
                    max={5000}
                    required
                    value={profileInput.targetCalories}
                    onChange={(e) => setProfileInput({ ...profileInput, targetCalories: Number(e.target.value) })}
                    className="w-full px-4.5 py-3.5 bg-surface-container rounded-xl text-sm border border-transparent focus:border-primary focus:outline-none transition-all font-sans font-medium text-on-surface"
                  />
                </div>

                {/* Allergens Checklist Box */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-primary">알레르기 주의 필터링 정보</label>
                  <div className="p-3 bg-surface-container rounded-xl max-h-[140px] overflow-y-auto space-y-2 border border-surface-container-high scrollbar-none">
                    {["돼지고기", "대두", "밀", "쇠고기", "우유", "난류", "닭고기", "조개류"].map(alg => {
                      const allergenChecking = profileInput.allergens.includes(alg);
                      return (
                        <label 
                          key={alg}
                          onClick={() => {
                            if (allergenChecking) {
                              setProfileInput({
                                ...profileInput,
                                allergens: profileInput.allergens.filter(a => a !== alg)
                              });
                            } else {
                              setProfileInput({
                                ...profileInput,
                                allergens: [...profileInput.allergens, alg]
                              });
                            }
                          }}
                          className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-on-surface-variant select-none"
                        >
                          <div className={`w-4 h-4 rounded flex items-center justify-center border-none ${allergenChecking ? "bg-primary text-on-primary" : "bg-surface-container-lowest"}`}>
                            {allergenChecking && <Check className="w-3.5 h-3.5" />}
                          </div>
                          <span>{alg}</span>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-on-surface-variant font-medium leading-normal -mt-1 opacity-90">
                    * 위 선택은 가상 가공용으로 등록되며, 급식 식단의 기재 성분과 연동되어 홈 화면 경보 배지에 적용될 수 있습니다.
                  </p>
                </div>

                {/* Save Button */}
                <button
                  type="submit"
                  className="w-full h-12 bg-primary text-on-primary font-bold text-sm rounded-xl cursor-pointer hover:opacity-90 active:scale-[0.98] transition-transform shadow flex items-center justify-center gap-1"
                >
                  프로필 저장 적용하기
                </button>
              </form>
            </div>
          </motion.div>
        )}

      </main>

      {/* --- APP BOTTOM NAVIGATION TAB BAR --- */}
      <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[420px] z-50 flex justify-space-between justify-around items-center px-4 py-3 bg-surface-container shadow-[0_-4px_20px_0_rgba(60,85,0,0.04)] rounded-t-xl border-t border-surface-container-high">
        
        {/* HOMETAB BUTTON */}
        <button 
          onClick={() => setCurrentTab('home')}
          className={`flex flex-col items-center justify-center active:scale-90 transition-all duration-200 gap-1 cursor-pointer flex-1 py-1 ${
            currentTab === 'home' 
              ? "text-primary font-bold scale-105" 
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <HomeIcon className="w-5.5 h-5.5" />
          <span className="text-[10px] font-sans font-bold">홈</span>
        </button>

        {/* SCHEDULE BUTTON */}
        <button 
          onClick={() => setCurrentTab('schedule')}
          className={`flex flex-col items-center justify-center active:scale-90 transition-all duration-200 gap-1 cursor-pointer flex-1 py-1 ${
            currentTab === 'schedule' 
              ? "text-primary font-bold scale-105" 
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <CalendarDays className="w-5.5 h-5.5" />
          <span className="text-[10px] font-sans font-bold">식단표</span>
        </button>

        {/* NUTRITION BUTTON */}
        <button 
          onClick={() => setCurrentTab('nutrition')}
          className={`flex flex-col items-center justify-center active:scale-90 transition-all duration-200 gap-1 cursor-pointer flex-1 py-1 ${
            currentTab === 'nutrition' 
              ? "text-primary font-bold scale-105" 
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <Calculator className="w-5.5 h-5.5" />
          <span className="text-[10px] font-sans font-bold">영양계산</span>
        </button>

        {/* PROFILE BUTTON */}
        <button 
          onClick={() => setCurrentTab('profile')}
          className={`flex flex-col items-center justify-center active:scale-90 transition-all duration-200 gap-1 cursor-pointer flex-1 py-1 ${
            currentTab === 'profile' 
              ? "text-primary font-bold scale-105" 
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          <UserIcon className="w-5.5 h-5.5" />
          <span className="text-[10px] font-sans font-bold">프로필</span>
        </button>

      </nav>

    </div>
  );
}

