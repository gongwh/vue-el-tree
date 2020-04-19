<template>
  <div class="select-tree multi-select-tree">
    <el-input placeholder="名称" v-model="searchText" clearable></el-input>
    <el-tree ref="tree"
             :class="!searchText ? 'not-filtered': ''"
             v-if="isLoadingTree"
             :data="data"
             :node-key="dataKey"
             highlight-current
             :check-strictly = "checkStrictly"
             :expand-on-click-node="false"
             :props="props"
             :default-checked-keys="defaultCheckedKeys"
             :default-expand-all="defaultExpandAll"
             @node-click="e_handleNodeClick"
             @check="e_handleNodeCheck"
             :filter-node-method="e_filterNode"
             :show-checkbox="true">
            <span class="slot-t-node" slot-scope="{ node }">
              <span class="icon-expand" @click="e_nodeExpandClick(node)">
                <img src="target.png" v-if="targetDataKey && node.data[targetDataKey]" alt="">
                <img src="plus-square.png" v-else-if="node.childNodes.length > 0" alt="">
                <img src="minus-square.png" v-else alt="">
              </span>
              <span>
                <span class="slot-t-node--label">{{ node.label }}</span>
              </span>
            </span>
    </el-tree>
  </div>
</template>
<script>
import demoValue from './api'

export default {
  name: 'multi-select-tree',
  data () {
    return {
      isLoadingTree: false, // 是否加载节点树
      delDialogVisible: false,
      tempNodeLabel: '',
      tempNodeLabelOld: '',
      searchText: ''
    }
  },
  props: {
    checkStrictly: {
      type: Boolean,
      default: false
    },
    data: { // 节点初始数据
      type: Array,
      default: demoValue
    },
    name: { // 树名，如用作部门树，则为 '部门'
      type: String,
      default: '节点'
    },
    dataKey: { // 节点数据唯一key值
      type: String,
      default: '_id'
    },
    // 目标节点判断属性
    // 不显示子节点中不包含目标节点的节点
    // 拥有该属性的节点为目标节点，将会展示为不同的样式，并且选中的时候过滤只剩下目标节点，
    targetDataKey: String,
    defaultCheckedKeys: Array,
    defaultExpandAll: {
      type: Boolean,
      default: true
    },
    props: { // 节点属性, 同 el-tree props
      type: Object,
      default: () => {
        return {
          children: 'children',
          label: 'name'
        }
      }
    }
  },
  mounted () {
    this.l_initData()
  },
  watch: {
    searchText (val) {
      this.$refs.tree.filter(val)
    }
  },
  methods: {
    l_stopEventPop () {
      window.event.stopPropagation()
    },
    l_initData () {
      this.isLoadingTree = true
    },
    e_handleNodeClick (data, node, store) { // 点击节点
      // 提交节点点击事件
      // console.log('节点点击', data, node, store)
      this.$emit('click', node.data)
    },
    e_handleNodeCheck (data, checkInfo) {
      // console.log('节点勾选', data, checkInfo)
      this.$emit('check', data, checkInfo)
    },
    e_nodeExpandClick (node) {
      this.l_stopEventPop()
      if (node.childNodes.length) {
        this.$set(node, 'expanded', !node.expanded)
        this.$emit('expand', node.data)
      }
    },
    e_inputBlur (node) {
      this.l_stopEventPop()
      // console.log('input 失去焦点', node)
      // 如果新节点不为空则进行新增
    },
    e_filterNode (value, data) {
      if (!value) {
        return true
      }
      return data[this.props.label].indexOf(value) !== -1
    },
    setCheckedKeys (keys) {
      this.$refs.tree.setCheckedKeys(keys)
    }
  }
}
</script>
