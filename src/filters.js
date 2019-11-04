import moment from 'moment'
moment.locale('zh')

export function date (value) {
  return moment(value).format('YYYY-MM-D LT')
}

export function onlyDate (value) {
  return moment(value).format('YYYY-MM-D')
}

export function relativeDate (value) {
  return moment(value).fromNow()
}

export function LLDate (value) {
  return moment(value).format('LL')
}
