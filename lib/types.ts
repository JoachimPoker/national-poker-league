export interface Player {
  id: number
  forename: string
  surname: string
  full_name: string
  date_of_birth: string
  card_number: number
  membership_number: number
  gdpr: boolean
  home_casino: string
}

export interface Event {
  id: number
  season_id: number
  casino: string
  tournament_name: string
  start_date: string
  buy_in: number
  is_high_roller: boolean
  is_low_roller: boolean
  web_sync_site_id: number
}

export interface Result {
  id: number
  player_id: number
  event_id: number
  season_id: number
  finish_position: number
  points: number
  prize_position: number
  prize_amount: number
}

export interface LeaderboardEntry {
  player_id: number
  full_name: string
  gdpr: boolean
  home_casino: string
  total_points: number
  result_count: number
  counted_results: number
  total_prize_money: number
  best_finish: number
}

export interface Season {
  id: number
  name: string
  year: number
  is_active: boolean
  npl_rule: string
}

export interface News {
  id: number
  title: string
  content: string
  social_link: string
  published_at: string
}

export interface SeasonPrize {
  id: number
  season_id: number
  league: string
  position_from: number
  position_to: number
  prize_description: string
  prize_amount: number
}

export interface AdminUser {
  id: number
  email: string
  name: string
}