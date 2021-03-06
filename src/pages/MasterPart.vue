<template>
  <master-details :master="master">
      <tabpage class="col-9" :tabs="tabs" :activated="currentTab" slot="details" @changed="onPageChanged">
        <div slot="overview">
          <h1>Welcome to our support center 1.0.1</h1>
          <p>
            Here we will list all indexed about current part!
          </p>
        </div>
        <div slot="purchases">
          <filters-form
            :config="purchaseFilters"
            class="my-2"
            @search="onSearchPurchases"
            @action="onCreatePurchase"
          />
          <item-list :items="purchases">
            <template slot-scope="po">
              <div class="row border-0 p-2">
                <div class="col">
                  <div class="d-flex">
                    <h6 class="text-primary mb-1 mr-auto selectable" @click="selectPurchase(po.item)">
                        <octicon :name="findIcon(po.item.data.state)" scale="1" style="color:green"/>
                        {{po.item.data.code}}
                    </h6>
                    <h6 class="text-primary font-weight-bolder selectable"  @click="selectSupplier(po.item.supplier)">{{po.item.supplier.data.name}}</h6>
                  </div>
                  <div class="d-flex justify-content-between">
                      <span class="ml-1">单价：{{po.item.data.price}}</span>
                      <span class="ml-1">数量：{{po.item.data.qty}}</span>
                      <span class="ml-1">金额: {{po.item.data.amount}}</span>
                      <span class="" style="width:100px">
                        <div class="progress mt-2" style="height:10px">
                              <div class="progress-bar bg-success" :class="poProgress(po.item.data).color" :style="poProgress(po.item.data).progress"></div>
                        </div>
                      </span>
                  </div>
                  <div class="d-flex mt-3">
                    <span v-if="po.item.data.refNo" class="" style="font-size:10px"><octicon name="pin" scale="1" style="color:yellow"/>{{po.item.data.refNo}}</span>
                    <octicon v-if="po.item.data.remark" name="tag" class="ml-3 mt-1" size="16" style="color:green"/>
                    <h6 class="ml-1 mt-1 mr-auto"  style="font-size:10px">{{po.item.data.remark}}</h6>
                    <octicon name="primitive-dot" scale="1.1" style="color:yellow"/>
                    <span class="ml-1" style="font-size:10px">更新于 {{po.item.data.modifiedDate | date}}</span>
                  </div>
                </div>
              </div>
            </template>
          </item-list>
        </div>
        <div slot="withdraws">
          <filters-form
            :config="purchaseFilters"
            class="my-2"
            @search="onSearchWithdraws"
            @action="onCreateWithdraw"
          />
          <item-list :items="withdraws">
            <template slot-scope="po">
              <div class="row border-0 p-2">
                <div class="col">
                  <div class="d-flex justify-content-between">
                      <h6 class="text-primary mb-1">
                        <octicon name="calendar" scale="1" style="color:green"/>
                        {{po.item.data.date | onlyDate}}
                      </h6>
                      <h6 class="text-primary mb-1">
                        <octicon name="database" scale="1" style="color:green"/>
                        <span class="ml-1">{{po.item.data.qty}}</span>
                      </h6>
                      <h6 class="text-primary mb-1">
                        <octicon name="person" scale="1" style="color:green"/>
                        <span class="ml-1">{{po.item.actor.data.name}}</span>
                      </h6>
                  </div>
                  <div class="d-flex mt-1">
                    <octicon name="primitive-dot" scale="1.1" style="color:yellow"/>
                    <span class="ml-1" style="font-size:10px">{{po.item.data.remark}}</span>
                    <octicon v-if="po.item.data.tags" name="tag" class="ml-3 mt-1 ml-auto" size="16" style="color:green"/>
                    <h6 class="ml-1 mt-1"  style="font-size:10px">{{po.item.data.tags}}</h6>
                  </div>
                </div>
              </div>
            </template>
          </item-list>
        </div>
      </tabpage>
  </master-details>
</template>

<script>
import {createQueryString, findEnumIcon} from '../helpers/QueryHelper.js'
import typeEnums from '../helpers/Enums.js'
import MasterDetails from '../components/MasterDetails/MasterDetails'
import FiltersForm from '../components/FiltersForm'
import ItemList from '../components/ItemList'
import {poProgress} from '../helpers/PurchaseHelper'
import state from '../store'
const ROUTE_NAME = 'masterPart'
export default {
  components: {
    MasterDetails,
    FiltersForm,
    ItemList
  },
  data () {
    return {
      currentTab: null,
      purchases: [],
      withdraws: []
    }
  },
  computed: {
    master () {
      const part = state.getters.selectedPart.data
      let img = part.img ? part.img : '/static/img/suixi.jpg'
      let subtitle
      if (part.brand) {
        subtitle = part.brand
        if (part.spec) {
          subtitle = subtitle + ' -- ' + part.spec
        }
      } else {
        subtitle = part.spec
      }
      return {
        editable: true,
        logo: img,
        title: part.name,
        subtitle,
        items: [
          {
            name: 'type',
            icon: 'milestone',
            type: 'radio',
            options: typeEnums.part
          },
          {
            name: 'code',
            icon: 'shield'
          },
          {
            name: 'name',
            icon: 'note'
          },
          {
            name: 'brand',
            icon: 'bookmark'
          },
          {
            name: 'spec',
            icon: 'eye'
          },
          {
            name: 'qty',
            icon: 'database'
          },
          {
            name: 'tags',
            icon: 'tag'
          },
          {
            name: 'unit',
            icon: 'ellipsis'
          }
        ],
        data: part,
        update: this.onSaveMaster
      }
    },
    purchaseFilters () {
      return {
        search: {width: 400},
        cmdButton: {text: '新增'}
      }
    },
    tabs () {
      return [
        {
          id: 'overview',
          title: '概要'
        },
        {
          id: 'purchases',
          title: '采购'
        },
        {
          id: 'withdraws',
          title: '领料'
        }
      ]
    }
  },
  async created () {
    let tab = state.getters.currentPage(ROUTE_NAME)
    tab = tab || 'purchases'
    this.currentTab = tab
    await this.loadPageData(tab)
  },

  methods: {
    findIcon (state) {
      return findEnumIcon(typeEnums.purchaseState, state)
    },
    poProgress,
    async onSaveMaster (data) {
      if (data) {
        await state.dispatch('updatePart', {data, links: state.getters.selectedPart.links})
      }
    },
    async onSearchPurchases (cond) {
      this.purchases = []
      cond.filters = [state.getters.selectedPart.data.id]
      let r = createQueryString(['part'], cond)
      this.purchases = await state.dispatch('searchPurchases', r)
    },
    async onSearchWithdraws (cond) {
      this.withdraws = []
      cond.filters = [state.getters.selectedPart.data.id]
      let r = createQueryString(['part'], cond)
      this.withdraws = await state.dispatch('searchWithdraws', r)
    },
    async loadPageData (page) {
      const loaders = {
        purchases: this.onSearchPurchases,
        withdraws: this.onSearchWithdraws
      }
      const func = loaders[page]
      if (!func) return
      await func({search: '', filters: []})
    },
    async onPageChanged (page) {
      state.commit('currentPage', {route: ROUTE_NAME, page})
      await this.loadPageData(page)
    },
    selectSupplier (supplier) {
      state.commit('selectedSupplier', supplier)
      let path = {
        name: 'masterSupplier'
      }
      this.$router.push(path)
    },
    selectPurchase (po) {
      state.commit('selectedPurchase', po)
      let path = {
        name: 'masterPOView'
      }
      this.$router.push(path)
    },
    onCreatePurchase () {
      state.commit('selectedPurchase')
      let path = {
        name: 'purchaseForm'
      }
      this.$router.push(path)
    },
    onCreateWithdraw () {
      let path = {
        name: 'withdrawForm'
      }
      this.$router.push(path)
    }
  }
}
</script>
