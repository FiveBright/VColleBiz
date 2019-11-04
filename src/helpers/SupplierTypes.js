import __ from 'underscore'
import enumsTypes from './Enums'

export function convert (type) {
  const p = __.find(enumsTypes.supplier, item => {
    return item.value === type
  })
  return p.name
}
export default convert
