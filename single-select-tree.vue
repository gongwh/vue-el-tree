<template>
  <div class="select-tree single-select-tree">
    <el-input placeholder="名称" v-model="searchText" clearable></el-input>
    <el-tree ref="tree"
             :class="{'not-filtered': !searchText}"
             v-if="!treeLoading"
             :data="data"
             :node-key="dataKey"
             highlight-current
             :expand-on-click-node="false"
             :props="props"
             :current-node-key="currentNodeKey"
             :default-expand-all="defaultExpandAll"
             @node-click="e_handleNodeClick"
             :filter-node-method="e_filterNode">
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
  name: 'single-select-tree',
  data () {
    return {
      treeLoading: true,
      delDialogVisible: false,
      tempNodeLabel: '',
      tempNodeLabelOld: '',
      searchText: '',
      currentNodeKey: null
    }
  },
  props: {
    value: {
      required: true
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
    props: { // 节点属性, 同 el-tree props
      type: Object,
      default: () => {
        return {
          children: 'children',
          label: 'name'
        }
      }
    },
    defaultExpandAll: {
      type: Boolean,
      default: true
    }
  },
  mounted () {
    if (this.value) {
      this.currentNodeKey = typeof this.value === 'string' ? this.value : this.value[this.dataKey]
    } else {
      this.currentNodeKey = null
    }
    this.treeLoading = false
    if (this.currentNodeKey) {
      this.$nextTick(() => this.$refs.tree.setCurrentKey(this.currentNodeKey))
    }
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
    e_handleNodeClick (data, node, store) { // 点击节点
      // 提交节点点击事件
      // console.log('节点点击', data, node, store)
      this.$emit('click', node.data)
      this.$emit('input', node.data)
    },
    e_nodeExpandClick (node) {
      this.l_stopEventPop()
      if (node.childNodes.length) {
        this.$set(node, 'expanded', !node.expanded)
        this.$emit('expand', node.data)
      }
    },
    e_filterNode (value, data) {
      if (!value) {
        return true
      }
      return data[this.props.label].indexOf(value) !== -1
    },
    getCurrentNode () {
      return this.$refs.tree.getCurrentNode()
    },
    setCurrentKey (key) {
      // console.log('设置当前节点', key)
      this.currentNodeKey = key
    }
  }
}
</script>
