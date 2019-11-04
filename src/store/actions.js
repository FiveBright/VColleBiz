import {
  $get,
  $post,
  $login,
  $put,
  $upload,
  $entry
} from '../plugins/fetch'
import router from '../router'
import queryCollection from '../helpers/DealWithQueryCollection'

const purchaseRefs = {
  Part: 'part',
  Supplier: 'supplier',
  User: ['applier', 'reviewer', 'creator']
}

const withdrawRefs = {
  Part: 'part',
  User: 'actor'
}

const actions = {
  async entry (ctx) {
    let entry = await $entry()
    let links = queryCollection.dealWithLinkages(entry)
    ctx.commit('entry', links)
  },

  async login ({
    commit
  }, data) {
    try {
      const session = await $login(data)
      if (session) {
        commit('token', session.token)
        commit('user', session.user)
        let path = router.currentRoute.params.wantedRoute || {
          name: 'home'
        }
        if (session.user.isAdmin) path = {name: 'admin'}

        router.replace(path)
      }
    } catch (e) {
      // do nothing
    }
  },

  async logout ({
    commit
  }) {
    commit('token', null)
    commit('user', null)
    if (router.currentRoute.matched.some(r => !r.meta.public)) {
      router.replace({
        name: 'login',
        params: {
          wantedRoute: router.currentRoute.fullPath
        }
      })
    }
  },

  async registerUser ({getters}, data) {
    const entry = getters.entry
    await $post(entry.register, data)
  },

  async authToUser ({commit}, {selfUrl, url, data}) {
    await $put(url, undefined, data)
    let user = await $get(selfUrl)
    user = await queryCollection.dealWithEntity(user, 'User')
    commit('selectedUser', user)
  },

  async updatePwd (ctx, {id, data}) {
    const url = `/auth/users/${id}/password`
    console.log('url:' + url)
    await $put(url, undefined, data)
  },

  async saveUserProfile ({getters, commit}, data) {
    const url = getters.entry.currentUser + '?scope=info'
    let toUpdate = {...data}
    await $put(url, undefined, toUpdate)
    commit('user', {...getters.user, ...data})
  },

  async searchUsers ({getters}, condi) {
    const data = await queryCollection.searchCollection(getters, 'users', condi, 'User')
    return data
  },

  async searchParts ({getters}, condi) {
    const data = await queryCollection.searchCollection(getters, 'parts', condi, 'Part')
    return data
  },

  async searchSuppliers ({getters}, condi) {
    const data = await queryCollection.searchCollection(getters, 'suppliers', condi, 'Supplier')
    return data
  },

  async searchPurchases ({getters}, condi) {
    const data = await queryCollection.searchCollection(getters, 'purchases', condi, 'Purchase', purchaseRefs)
    return data
  },

  async searchWithdraws ({getters}, condi) {
    const data = await queryCollection.searchCollection(getters, 'withdraws', condi, 'Withdraw', withdrawRefs)
    return data
  },

  async updatePart ({commit}, data) {
    await $put(data.links.self, data.data.__v, data.data)
    let updated = await $get(data.links.self)
    updated = await queryCollection.dealWithEntity(updated, 'Part')
    commit('selectedPart', updated)
  },

  async updateSupplier ({commit}, data) {
    await $put(data.links.self, data.data.__v, data.data)
    let updated = await $get(data.links.self)
    updated = await queryCollection.dealWithEntity(updated, 'Supplier')
    commit('selectedSupplier', updated)
  },

  async updatePurchase ({commit}, data) {
    await $put(data.links.self, data.data.__v, data.data)
    const updated = await $get(data.links.self)
    const entity = await queryCollection.dealWithEntity(updated, 'Purchase', purchaseRefs)
    commit('selectedPurchase', entity)
  },

  async getSupplier (ctx, url) {
    const data = await $get(url)
    return data
  },

  async getPart (ctx, url) {
    const data = await $get(url)
    return data
  },

  async createPart ({getters}, data) {
    const entry = getters.entry
    const url = entry.parts
    await $post(url, data)
  },

  async createSupplier ({getters}, data) {
    const entry = getters.entry
    const url = entry.suppliers
    await $post(url, data)
  },

  async createPurchase ({getters}, data) {
    const entry = getters.entry
    const url = entry.purchases
    await $post(url, data)
  },

  async createWithdraw ({getters}, data) {
    const entry = getters.entry
    const url = entry.withdraws
    await $post(url, data)
  },

  async poTransaction ({getters}, {url, type, data}) {
    const finalUrl = `${url}?type=${type}`
    const actor = getters.user.id
    await $post(finalUrl, {...data, actor})
  },

  async refreshSelectedPurchase ({getters, commit}) {
    let data = getters.selectedPurchase
    const po = await $get(data.links.self)
    const entity = await queryCollection.dealWithEntity(po, 'Purchase', purchaseRefs)
    commit('selectedPurchase', entity)
  },

  async searchPurchaseTransTasks ({
    commit
  }, condi) {
    const tasks = await $get('/task/purTransTasks')
    // commit('purTransTasks', tasks)
    return tasks
  },

  async importPurchasesFromCsv ({
    commit
  }, formData) {
    const result = await $upload('/purchases/csv', formData)
    return result.json()
  }
}

export default actions
