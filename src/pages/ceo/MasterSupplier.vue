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
          <filters-form :config="purchaseFilters" class="my-2" @search="onSearchPurchases"/>
          <item-list :items="purchases">
            <template slot-scope="po">
              <div class="row border-0 p-2">
                <div class="col">
                  <div class="d-flex">
                    <h6 class="text-primary mb-1 mr-auto selectable" @click="selectPurchase(po.item)">
                        <octicon :name="findIcon(po.item.data.state)" scale="1" style="color:green"/>
                        {{po.item.data.code}}
                    </h6>
                  </div>
                  <div class="d-flex mt-1">
                    <h6 class="text-primary mb-1 mr-auto selectable" @click="selectPart(po.item.part)">{{po.item.part.data.name}}</h6>
                    <octicon v-if="po.item.part.data.brand" name="bookmark" class="mt-1 mr-1" size="16" style="color:green"/>
                    <h6 class="font-weight-bolder">{{po.item.part.data.brand}}</h6>
                    <octicon v-if="po.item.part.data.spec" name="eye" class="mt-1 mr-1 ml-3" size="16" style="color:green"/>
                    <h6 class="font-weight-bolder">{{po.item.part.data.spec}}</h6>
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
      </tabpage>
  </master-details>
</template>

<script>
import typeEnums from '../../helpers/Enums.js'
import supplierTypes from '../../helpers/SupplierTypes.js'
import {createQueryString, findEnumIcon} from '../../helpers/QueryHelper.js'
import MasterDetails from '../../components/MasterDetails/MasterDetails'
import FiltersForm from '../../components/FiltersForm'
import ItemList from '../../components/ItemList'
import {poProgress} from '../../helpers/PurchaseHelper'
import state from '../../store'
const ROUTE_NAME = 'ceoMasterSupplier'

export default {
  components: {
    MasterDetails,
    FiltersForm,
    ItemList
  },
  data () {
    return {
      currentTab: null,
      purchases: []
    }
  },
  computed: {
    master () {
      const supplier = state.getters.selectedSupplier.data
      return {
        visible: true,
        logo: '/static/img/suixi.jpg',
        title: supplier.name,
        subtitle: supplierTypes(supplier.type),
        items: [
          {
            name: 'type',
            icon: 'milestone',
            type: 'radio',
            options: typeEnums.supplier
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
            name: 'address',
            icon: 'location'
          },
          {
            name: 'account',
            icon: 'hubot'
          },
          {
            name: 'link',
            icon: 'link'
          },
          {
            name: 'tags',
            icon: 'tag'
          }
        ],
        data: supplier,
        update: this.onSaveMaster
      }
    },
    options () {
      let {supplier} = typeEnums
      return supplier
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
        }
      ]
    },
    purchaseFilters () {
      return {
        search: {width: 400}
      }
    }
  },
  async created () {
    let tab = state.getters.currentPage(ROUTE_NAME)
    tab = tab || 'purchases'
    this.currentTab = tab
    await this.loadPageData(tab)
  },
  methods: {
    supplierTypes,
    findIcon (state) {
      return findEnumIcon(typeEnums.purchaseState, state)
    },
    poProgress,
    async onSaveMaster (data) {
      if (data) {
        await state.dispatch('updateSupplier', {data, links: state.getters.selectedSupplier.links})
      }
    },
    async onSearchPurchases (cond) {
      let r = createQueryString(['supplier'], cond)
      this.purchases = await state.dispatch('searchPurchases', r)
    },
    async loadPageData (page) {
      const loaders = {purchases: this.onSearchPurchases}
      const func = loaders[page]
      if (!func) return
      await func({search: '', filters: [state.getters.selectedSupplier.data.id]})
    },
    async onPageChanged (page) {
      state.commit('currentPage', {route: ROUTE_NAME, page})
      await this.loadPageData(page)
    },
    selectPart (part) {
      state.commit('selectedPart', part)
      let path = {
        name: 'ceoMasterPart'
      }
      this.$router.push(path)
    },
    selectPurchase (po) {
      state.commit('selectedPurchase', po)
      let path = {
        name: 'ceoMasterPurchase'
      }
      this.$router.push(path)
    }
  }
}
</script>
