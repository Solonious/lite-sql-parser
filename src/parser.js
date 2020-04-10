import { parse as hive } from '../build/hive'
import { parse as mysql } from '../build/mysql'
import { parse as mariadb } from '../build/mariadb'
import { parse as postgresql } from '../build/postgresql'
import { parse as transactsql } from '../build/transactsql'
import astToSQL from './sql'
import { DEFAULT_OPT, setParserOpt } from './util'

const parser = {
  hive,
  mysql,
  mariadb,
  postgresql,
  transactsql,
}
class Parser {
  astify(sql, opt = DEFAULT_OPT) {
    const astInfo = this.parse(sql, opt)
    return astInfo && astInfo.ast
  }

  sqlify(ast, opt = DEFAULT_OPT) {
    setParserOpt(opt)
    return astToSQL(ast, opt)
  }

  parse(sql, opt = DEFAULT_OPT) {
    const { database = 'mysql' } = opt
    setParserOpt(opt)
    const typeCase = database.toLowerCase()
    if (parser[typeCase]) return parser[typeCase](sql.trim())
    throw new Error(`${database} is not supported currently`)
  }

  whiteListCheck(sql, whiteList, opt = DEFAULT_OPT) {
    if (!whiteList || whiteList.length === 0) return
    const { type = 'table' } = opt
    if (!this[`${type}List`] || typeof this[`${type}List`] !== 'function') throw new Error(`${type} is not valid check mode`)
    const checkFun = this[`${type}List`].bind(this)
    const authorityList = checkFun(sql, opt)
    let hasAuthority = true
    let denyInfo = ''
    for (const authority of authorityList) {
      let hasCorrespondingAuthority = false
      for (const whiteAuthority of whiteList) {
        const regex = new RegExp(whiteAuthority, 'i')
        if (regex.test(authority)) {
          hasCorrespondingAuthority = true
          break
        }
      }
      if (!hasCorrespondingAuthority) {
        denyInfo = authority
        hasAuthority = false
        break
      }
    }
    if (!hasAuthority) throw new Error(`authority = '${denyInfo}' is required in ${type} whiteList to execute SQL = '${sql}'`)
  }

  tableList(sql, opt) {
    const astInfo = this.parse(sql, opt)
    return astInfo && astInfo.tableList
  }

  columnList(sql, opt) {
    const astInfo = this.parse(sql, opt)
    return astInfo && astInfo.columnList
  }
}

export default Parser
