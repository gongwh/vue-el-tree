/*
* @moduleName: pop-select-tree
* @Author: SNOW
* @LastModifiedBy: SNOW
* @Date: 2019-07-05 17:53:20
* @LastEditTime: 2019-07-05 17:53:20
*/
<template>
  <div class="tree-select multi-tree-select">
    <el-select v-model="selectedNodes"
               :disabled="disabled"
               popper-class="select-option"
               ref="select"
               multiple
               collapse-tags
               collapse-tags-all
               :default-expand-all="defaultExpandAll"
               :value-key="dataKey"
               :name="labelKey"
               :popper-append-to-body="false"
               :filterable="false"
               :clearable="clearable"
               @click.stop
               @visible-change="e_visibleChange"
               @clear="e_clear"
               custom-drop-down
               v-popover:popover>
    </el-select>
    <el-popover ref="popover" placement="top" :width="width" v-model="visible" trigger="manual"
                popper-class="popper-select-tree">
      <el-scrollbar tag="div" wrap-class="el-select-dropdown__wrap" view-class="el-select-dropdown__list"
                    class="is-empty">
        <multi-select-tree
          v-clickoutside="handleOutSideClick"
          v-if="!treeLoading"
          :data="localData"
          :dataKey="dataKey"
          :props="treeProps"
          :check-strictly="checkStrictly"
          :default-checked-keys="defaultCheckedKeys"
          :target-data-key="targetDataKey"
          ref="tree"
          @check="e_treeCheck">
        </multi-select-tree>
      </el-scrollbar>
      <div class="operation-block">
        <el-button class="light-button" @click="handleClose">取消</el-button>
        <el-button class="weight-button" @click="e_confirmSelect">确认</el-button>
      </div>
    </el-popover>
  </div>
</template>

<script>
import lodash from 'lodash'
import Clickoutside from 'snow-element-ui/src/utils/clickoutside'

export default {
  name: 'multi-tree-select',
  directives: { Clickoutside },
  data () {
    return {
      isClosed: false,
      localData: [],
      visible: false,
      clickedNode: null,
      checkedNodes: [],
      selectedNodes: [],
      selectedLabels: [],
      defaultCheckedKeys: [],
      treeLoading: true,
      width: 300
    }
  },
  props: {
    checkStrictly: {
      type: Boolean,
      default: false
    },
    value: {
      required: true,
      type: Array
    },
    data: {
      type: Array,
      default () {
        return []
      }
    },
    dataKey: {
      type: String,
      default: '_id'
    },
    // 目标节点判断属性
    // 不显示子节点中不包含目标节点的节点
    // 拥有该属性的节点为目标节点，将会展示为不同的样式，并且选中的时候过滤只剩下目标节点，
    targetDataKey: String,
    labelKey: {
      type: String,
      default: 'name'
    },
    defaultExpandAll: {
      type: Boolean,
      default: true
    },
    treeProps: { // 节点属性, 同 el-tree props
      type: Object,
      default: () => {
        return {
          children: 'children',
          label: 'name'
        }
      }
    },
    clearable: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  mounted () {
    console.log('mounted的时候value', this.value)
    this.l_getSelectedNodes(this.value)
    this.treeLoading = false
    this.l_getLocalData()
  },
  watch: {
    visible (nV, oV) {
      if (nV) {
        if (!this.value || !this.value.length) {
          this.l_clearContent()
        }
        this.clickedNode = null
      }
    },
    data: {
      handler: 'l_getLocalData',
      deep: true
    },
    value (nV, oV) {
      this.checkedNodes = lodash.cloneDeep(nV)
      this.l_getSelectedNodes(nV)
    },
    selectedNodes (val) {
      this.l_getDefaultCheckedKeys(val)
    }
  },
  methods: {
    handleOutSideClick () {
      if (this.visible) {
        this.visible = false
      }
    },
    handleClose () {
      console.log('关闭')
      this.visible = false
    },
    l_getLocalData () {
      if (!this.targetDataKey) {
        this.localData = this.data
      } else {
        this.localData = this.l_filterTreeByTarget(this.data)
      }
    },
    e_visibleChange (visible) {
      if (visible) {
        this.visible = visible
        this.l_updateWidth()
      }
    },
    l_updateWidth () {
      this.$nextTick(() => {
        if (this.$refs.select.$el.clientWidth > 150) {
          this.width = this.$refs.select.$el.clientWidth
        }
      })
    },
    l_recursiveFilterTreeByTarget (tree = []) {
      const res = []
      for (const node of tree) {
        const children = this.l_recursiveFilterTreeByTarget(node[this.treeProps.children])
        if (node[this.targetDataKey] || children.length) {
          const _node = lodash.clone(node)
          _node[this.treeProps.children] = children
          res.push(_node)
        }
      }
      return res
    },
    l_filterTreeByTarget (tree = []) {
      return lodash.cloneDeep(this.l_recursiveFilterTreeByTarget(tree))
    },
    l_filterNodesByTarget (nodes = []) {
      if (this.targetDataKey) {
        return nodes.filter(n => Boolean(n[this.targetDataKey]))
      } else {
        return lodash.cloneDeep(nodes)
      }
    },
    l_getSelectedNodes (nodes) {
      this.selectedNodes = lodash.cloneDeep(this.l_filterNodesByTarget(nodes))
    },
    l_getDefaultCheckedKeys (nodes) {
      this.defaultCheckedKeys = nodes ? nodes.map(item => item[this.dataKey]) : []
    },
    e_confirmSelect () {
      this.visible = false
      this.l_getSelectedNodes(this.checkedNodes)
      this.e_emitModelValue()
    },
    e_clear () {
      this.l_clearContent()
      this.e_emitModelValue()
      this.visible = false
    },
    l_clearContent () {
      this.checkedNodes = []
      this.selectedNodes = []
      this.$refs.tree.setCheckedKeys([])
    },
    e_treeCheck (node, info) {
      if (info && info.checkedNodes) {
        this.checkedNodes = lodash.cloneDeep(info.checkedNodes)
      }
    },
    e_emitModelValue () {
      this.$emit('input', this.selectedNodes)
      this.$emit('check', this.checkedNodes)
    }
  }
}
</script>
