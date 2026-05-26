export interface Tag {
  id:            string
  user_id:       string
  name:          string
  color:         string
  contact_count: number
  created_at:    string
}

export interface ContactTag {
  contact_id: string
  tag_id:     string
  tag:        Tag
}

export interface ContactWithTags {
  id:              string
  user_id:         string
  name:            string | null
  phone:           string
  email:           string | null
  tags:            string[]        // legacy array
  attributes:      Record<string, string>
  total_orders:    number
  total_spent:     number
  last_order_at:   string | null
  first_order_at:  string | null
  health_score:    number
  opted_in:        boolean
  created_at:      string
  contact_tags:    { tag: Tag }[]  // joined relation
}

export interface FilterCondition {
  id:          string
  field:       FilterField
  operator:    FilterOperator
  value:       string | number | string[] | null
}

export interface Segment {
  id:                 string
  user_id:            string
  name:               string
  description:        string | null
  filters:            FilterCondition[]
  conjunction:        'AND' | 'OR'
  contact_count:      number
  last_calculated_at: string | null
  created_at:         string
  updated_at:         string
}

export type FilterField =
  | 'tag'
  | 'not_tag'
  | 'total_orders'
  | 'total_spent'
  | 'last_order_at'
  | 'first_order_at'
  | 'attribute'

export type FilterOperator =
  | 'is' | 'is_not'
  | 'equals' | 'gt' | 'lt' | 'gte' | 'lte'
  | 'before' | 'after' | 'within_days' | 'more_than_days_ago'
  | 'contains'

export type FilterValueType = 'tag' | 'number' | 'currency' | 'date' | 'attribute'

export interface FilterFieldDef {
  value:     FilterField
  label:     string
  valueType: FilterValueType
}

export interface FilterFieldGroup {
  group:  string
  fields: FilterFieldDef[]
}

export interface SampleContact {
  id:           string
  name:         string | null
  phone:        string
  contact_tags: { tag: Tag }[]
}
