/**
 * 대한민국 KST (Asia/Seoul) 시간대를 온전히 보장하기 위한 날짜 유틸리티 함수 모음입니다.
 */

/**
 * 현지 실행 환경에 관계없이 Asia/Seoul 표준 시각 기준의 '오늘' Date 객체를 반환합니다.
 * 시, 분, 초, 밀리초는 0으로 정규화됩니다.
 */
export function getTodayKST(): Date {
  // ISO 문자열 기준으로 Asia/Seoul 시간 오프셋 적용
  const now = new Date();
  
  // Intl.DateTimeFormat을 통해 한국 타임존의 실제 연, 월, 일 획득
  const formatter = new Intl.DateTimeFormat('ko-KR', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: 'numeric',
    day: 'numeric'
  });
  
  const parts = formatter.formatToParts(now);
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '2026', 10);
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '5', 10) - 1;
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '21', 10);
  
  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * Date 객체를 "5월 15일 금요일" 과 같이 친숙한 한글 형식으로 포맷팅합니다.
 */
export function formatKoreanDate(date: Date): string {
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const dayName = dayNames[date.getDay()];
  
  return `${month}월 ${day}일 ${dayName}`;
}

/**
 * Date 객체를 "YYYYMMDD" 형태의 NEIS API 연동 가능한 8자리 키 문자열로 변환합니다.
 */
export function formatDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `${year}${month}${day}`;
}

/**
 * 주어진 날짜가 포함된 주의 월요일(Day 1)부터 금요일(Day 5)까지 5일간의 Date 객체 배열을 구합니다.
 */
export function getWeekDates(date: Date): Date[] {
  const current = new Date(date);
  const day = current.getDay(); // 0(일) ~ 6(토)
  
  // 월요일을 시작 기준(0)으로 하는 오프셋 계산
  // 일요일(0)은 이전 주 월요일 대신 현재 주의 월요일로 정렬될 수 있도록 조정
  // 또는, 일요일인 경우에도 이전 주나 혹은 당해 주의 월요일로 일관된 주간 뷰를 연산합니다.
  const offsetToMonday = day === 0 ? -6 : 1 - day;
  
  const monday = new Date(current);
  monday.setDate(current.getDate() + offsetToMonday);
  monday.setHours(0, 0, 0, 0);
  
  const weekDates: Date[] = [];
  for (let i = 0; i < 5; i++) {
    const nextDate = new Date(monday);
    nextDate.setDate(monday.getDate() + i);
    weekDates.push(nextDate);
  }
  
  return weekDates;
}

/**
 * 해당 날짜의 "M월 N주차" 정보를 계산합니다.
 */
export function getWeekOfMonth(date: Date): { month: number; week: number } {
  const target = new Date(date);
  const year = target.getFullYear();
  
  // 해당 월의 1일 날짜 객체 생성
  const firstDayOfMonth = new Date(year, target.getMonth(), 1);
  const firstDayOfWeek = firstDayOfMonth.getDay(); // 0: 일, 1: 월 ... 6: 토
  
  // 월요일을 주의 시작(0)으로 맞춰서 오프셋 생성
  const dayOffset = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
  const dayNum = target.getDate();
  
  // Math.ceil을 이용하여 보정된 날짜 번호로부터 주차 수 산출
  const week = Math.ceil((dayNum + dayOffset) / 7);
  
  return {
    month: target.getMonth() + 1,
    week: week
  };
}

/**
 * 오늘 날짜가 주말(토, 일)인 경우, 대체 급식일(가장 가까운 다음 월요일) 또는 평일 오늘을 기본 보정 날짜로 가져옵니다.
 */
export function getDefaultSelectedDate(today: Date): Date {
  const day = today.getDay();
  const adjusted = new Date(today);
  
  if (day === 6) { // 토요일 -> 다음 월요일 (+2)
    adjusted.setDate(today.getDate() + 2);
  } else if (day === 0) { // 일요일 -> 다음 월요일 (+1)
    adjusted.setDate(today.getDate() + 1);
  }
  
  adjusted.setHours(0, 0, 0, 0);
  return adjusted;
}

/**
 * 요일 이름을 한 글자로 반환합니다. (월, 화, 수...)
 */
export function getKoreanDayOfWeek(date: Date): string {
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];
  return dayNames[date.getDay()];
}

/**
 * 주어진 날짜가 주말(토요일 또는 일요일)인지 판단합니다.
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}
