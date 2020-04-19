/*
* @moduleName: pop-select-tree
* @Author: SNOW
* @LastModifiedBy: SNOW
* @Date: 2019-07-05 17:53:20
* @LastEditTime: 2019-07-05 17:53:20
*/
<template>
  <div class="tree-select single-tree-select">
    <el-select v-model="selectedNodeLabel"
               :disabled="disabled"
               popper-class="select-option"
               ref="select"
               :placeholder="placeholder"
               :value-key="dataKey"
               :popper-append-to-body="false"
               :filterable="false"
               :clearable="clearable"
               @visible-change="e_visibleChange"
               @clear="e_clear"
               custom-drop-down
               v-popover:popover>
    </el-select>
    <el-popover ref="popover" placement="top" :width="width"  v-model="visible" trigger="manual"
                popper-class="popper-select-tree">
      <el-scrollbar tag="div" wrap-class="el-select-dropdown__wrap" view-class="el-select-dropdown__list"
                    class="is-empty">
        <single-select-tree
          v-clickoutside="handleOutSideClick"
          v-if="!treeLoading"
          :data="localData"
          :dataKey="dataKey"
          :props="treeProps"
          ref="select-tree"
          :default-expand-all="false"
          :value="selectedNode"
          :target-data-key="targetDataKey"
          @click="e_onNodeClick">
        </single-select-tree>
      </el-scrollbar>
      <div class="operation-block">
        <el-button class="light-button" @click="visible = false">取消</el-button>
        <el-button class="weight-button" @click="e_confirmSelect"
                   :disabled="Boolean(!clickedNode || (targetDataKey && !clickedNode[targetDataKey]))">确认</el-button>
      </div>
    </el-popover>
  </div>
</template>

<script>
import lodash from 'lodash'
import Clickoutside from 'snow-element-ui/src/utils/clickoutside'

export default {
  name: 'single-tree-select',
  data () {
    return {
      localData: [],
      visible: false,
      clickedNode: null,
      selectedNode: null,
      selectedNodeLabel: null,
      treeLoading: true,
      width: 300
    }
  },
  directives: { Clickoutside },
  props: {
    value: {
      required: true
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
    treeProps: { // 节点属性, 同 el-tree props
      type: Object,
      default: () => {
        return {
          children: 'children',
          label: 'name'
        }
      }
    },
    labelKey: {
      type: String,
      default: 'name'
    },
    clearable: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: '请选择'
    }
  },
  mounted () {
    this.l_setLocalDataFrom(this.data)
    this.treeLoading = false
  },
  watch: {
    visible (nV, oV) {
      console.log('visible change', nV)
      if (nV) {
        this.clickedNode = null
      }
    },
    selectedNode (nV) {
      this.l_updateLabel()
      this.e_emitModelValue()
    },
    value (nV, oV) {
      this.l_setSelectedNodeFrom(nV)
    },
    data (nV) {
      this.l_setLocalDataFrom(nV)
    }
  },
  methods: {
    handleOutSideClick () {
      if (this.visible) {
        this.visible = false
      }
    },
    refresh (data) {
      this.l_setSelectedNodeFrom(data)
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
    l_setLocalDataFrom (data = []) {
      if (!this.targetDataKey) {
        this.localData = data
      } else {
        this.localData = this.l_filterTreeByTarget(data)
      }
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
    l_setSelectedNodeFrom (value) {
      if (!this.selectedNode) {
        this.selectedNode = lodash.cloneDeep(value)
        return
      }
      if (value) {
        if (typeof value === 'string' && this.selectedNode !== value) {
          this.selectedNode = value
        }
        if (typeof value === 'object' && this.selectedNode[this.dataKey] !== value[this.dataKey]) {
          this.selectedNode = lodash.cloneDeep(value)
        }
        return
      }
      this.selectedNode = null
    },
    e_onNodeClick (node) {
      this.clickedNode = node
    },
    e_confirmSelect () {
      this.l_setSelectedNodeFrom(this.clickedNode)
      this.visible = false
    },
    e_clear () {
      this.selectedNode = null
      this.$emit('input', null)
    },
    l_updateLabel () {
      if (this.selectedNode) {
        this.selectedNodeLabel = typeof this.selectedNode === 'string' ? this.selectedNode : this.selectedNode[this.labelKey]
      } else {
        this.selectedNodeLabel = ''
      }
    },
    e_emitModelValue () {
      if (!this.selectedNode) {
        this.$emit('input', null)
        return
      }
      if (this.selectedNode) {
        if (typeof this.selectedNode === 'string' && this.selectedNode !== this.value) {
          this.$emit('input', lodash.cloneDeep(this.selectedNode))
          return
        }
        if (typeof this.selectedNode === 'object' && (!this.value || this.selectedNode[this.dataKey] !== this.value[this.dataKey])) {
          this.$emit('input', lodash.cloneDeep(this.selectedNode))
        }
      }
    }
  }
}
</script>
