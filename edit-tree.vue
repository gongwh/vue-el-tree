<template>
  <div class="tree-wrapper">
    <el-input :placeholder="searchPlaceholder" v-model="searchText" clearable></el-input>
    <el-tree ref="tree" class="expand-el-tree"
             :data="dataLocal"
             :node-key="dataKey"
             highlight-current
             :expand-on-click-node="false"
             :props="props"
             :empty-text="emptyText"
             :default-expand-all="true"
             @node-click="e_handleNodeClick"
             :draggable="draggable"
             :allow-drop="t_allowDrop"
             :allow-drag="t_allowDrag"
             :filter-node-method="e_filterNode"
             @node-drop="e_nodeDropFinished">
            <span class="slot-t-node" slot-scope="{ node }">
        	  <!-- 未编辑状态 -->
            <span class="icon-expand" v-if="node.childNodes.length > 0" @click="e_nodeExpandClick(node)">
              <img src="plus-square.png" alt="">
            </span>
            <span class="icon-expand" v-else @click="e_nodeExpandClick(node)">
              <img src="minus-square.png" alt="">
            </span>
        		<span v-show="!node.isEdit">
        			<span class="slot-t-node--label">{{ node.label }}</span>
	        		<span class="slot-t-icons" v-show="node.store.currentNode && node.key === node.store.currentNode.key">
	        			<el-button v-if="edit" icon="el-icon-edit" @click="e_nodeUpdate(node)"></el-button>
	        			<el-button v-if="del" icon="el-icon-delete" @click="e_nodeDel(node)"></el-button>
	        			<el-button v-if="add" icon="el-icon-circle-plus-outline" @click="e_nodeAdd(node)"></el-button>
	        		</span>
        		</span>
        		<span v-show="node.isEdit || node.data.isNew">
        			<el-input class="slot-t-input" size="mini"
                        v-model="tempNodeLabel"
                        :ref="'slot-tree-input-'+ node.data[dataKey]"
                        @click.native="e_inputClick(node)"
                        @blur.stop="e_inputBlur(node)"
                        @keyup.enter.native="e_inputConfirm(node)"></el-input>
        		</span>
        	</span>
    </el-tree>
    <div class="add-button">
      <el-button :disabled="isEditing" @click="l_addRootNode">新增{{name}}</el-button>
    </div>
  </div>
</template>
<script>
import demoValue from './api'
import { uuid } from 'vue-uuid'

export default {
  name: 'edit-tree',
  data () {
    return {
      dataLocal: null,
      isTreeLoading: true, // 是否加载节点树
      tempNodeLabel: '',
      tempNodeLabelOld: '',
      searchText: '',
      isEditing: false
    }
  },
  props: {
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
    props: { // 节点属性, 同 el-tree props
      type: Object,
      default: () => {
        return {
          children: 'children',
          label: 'name',
          parent: 'parent'
        }
      }
    },
    emptyText: {
      type: String,
      default: '暂无数据'
    },
    searchPlaceholder: {
      type: String,
      default: '名称'
    },
    draggable: {
      type: Boolean,
      default: true
    },
    edit: {
      type: Boolean,
      default: true
    },
    add: {
      type: Boolean,
      default: true
    },
    del: {
      type: Boolean,
      default: true
    },
    updateInner: {
      type: Boolean,
      default: true
    },
    addInner: {
      type: Boolean,
      default: true
    },
    deleteInner: {
      type: Boolean,
      default: true
    }
  },
  activated () {
    // console.log('edit-tree activated')
    const currentNodeKey = this.$refs.tree.getCurrentKey()
    if (currentNodeKey) {
      this.$refs.tree.setCurrentKey(currentNodeKey)
    }
  },
  mounted () {
    this.dataLocal = this.data
  },
  watch: {
    searchText (val) {
      this.$refs.tree.filter(val)
    },
    data (val) {
      this.dataLocal = val
    },
    dataLocal () {
      this.l_syncLoading()
    }
  },
  methods: {
    e_filterNode (value, data) {
      if (!value) {
        return true
      }
      return data[this.props.label].indexOf(value) !== -1
    },
    l_stopEventPop () {
      window.event.stopPropagation()
    },
    l_syncLoading () {
      this.isTreeLoading = !(Array.isArray(this.dataLocal) && this.dataLocal.length)
    },
    // 拖拽时判定目标节点能否被放置
    t_allowDrop (draggingNode, dropNode, type) {
      if (type === 'prev' || type === 'next') {
        return false
      }
      for (let i = 0; i < dropNode.childNodes.length; i++) {
        if (dropNode.childNodes[i].label === draggingNode.label &&
            dropNode.childNodes[i].key !== draggingNode.key) {
          return false
        }
      }
      return true
    },
    // 判断节点能否被拖拽
    t_allowDrag (draggingNode) {
      // 根节点不可拖动
      return true
    },
    // 拖拽完成 参数依次为：被拖拽节点对应的 Node、结束拖拽时最后进入的节点、被拖拽节点的放置位置（before、after、inner）、event
    e_nodeDropFinished (draggingNode, dropNode, dropType, event) {
      // console.log('节点移动完毕', draggingNode, dropNode)
      const nodeData = draggingNode.data
      nodeData.parent = dropNode.key
      this.$emit('move', nodeData)
    },
    e_handleNodeClick (data, node, store) { // 点击节点
      // 提交节点点击事件
      // console.log('节点选中', data, node, store)
      if (this.updateInner) {
        this.$set(node, 'isEdit', false)
      }
      this.$emit('click', node.data)
    },
    e_nodeExpandClick (node) {
      this.l_stopEventPop()
      this.$set(node, 'expanded', !node.expanded)
      this.$emit('expand', node.data)
    },
    e_inputBlur (node) {
      this.l_stopEventPop()
      // console.log('input 失去焦点', node)
      if (node.isEdit) {
        this.$set(node, 'isEdit', false)
      }
      // 如果新节点不为空则进行新增
      this.tempNodeLabel = this.tempNodeLabel.trim()
      if (this.tempNodeLabel !== node.label) {
        this.e_inputConfirm(node)
      }
      // 节点为空进行删除
      if (!node.label) {
        this.l_deleteNodeFromTree(node)
      }
      this.isEditing = false
      this.l_syncLoading()
    },
    e_inputConfirm (node) {
      this.l_stopEventPop()
      this.tempNodeLabel = this.tempNodeLabel.trim()
      if (this.tempNodeLabel) {
        for (const sameLevelNode of node.parent.childNodes) {
          if (sameLevelNode.label === this.tempNodeLabel &&
              sameLevelNode.key !== node.key) {
            this.$message.warning('已存在同级该' + this.name)
            this.$nextTick(() => {
              this.e_nodeUpdate(node)
            })
            return
          }
        }
        this.$set(node.data, this.props.label, this.tempNodeLabel)
        if (node.data.isNew) {
          if (node.data.isRoot) {
            this.$emit('add', { name: node.data[this.props.label], parent: null })
          } else {
            this.$emit('add', { name: node.data[this.props.label], parent: node.parent.data })
          }
          this.$set(node.data, 'isNew', false)
        } else {
          if (this.tempNodeLabelOld !== node.label) {
            this.$emit('update', node.data)
          }
        }
        this.tempNodeLabel = ''
        this.$nextTick(() => {
          this.$refs['slot-tree-input-' + node.key].blur()
          this.isEditing = false
        })
      }
    },
    e_nodeUpdate (node) { // 编辑节点
      this.l_stopEventPop()
      // console.log('节点编辑', node)
      if (this.updateInner) {
        if (!node.isEdit) { // 检测isEdit是否存在or是否为false
          this.$set(node, 'isEdit', true)
        }
        this.tempNodeLabel = node.label
        this.tempNodeLabelOld = node.label
        this.$nextTick(() => {
          this.$refs['slot-tree-input-' + node.key].focus()
          this.isEditing = true
        })
      } else {
        this.$emit('update', node.data)
      }
    },
    e_nodeDel (node) { // 删除节点
      this.l_stopEventPop()
      if (node.data.children && node.data.children.length !== 0) {
        this.$message.warning('此' + this.name + '有子' + this.name + ',不可删除!')
        return false
      } else {
        if (this.deleteInner) {
          this.$confirmDialog(`确认删除该${this.name}?`).then(() => {
            this.l_deleteNodeFromTree(node)
            this.$emit('delete', node.data)
          }
          )
        } else {
          this.$emit('delete', node.data)
        }
      }
    },
    l_addRootNode () {
      if (this.addInner) {
        this.l_addNewTreeNode()
      } else {
        this.$emit('add', null)
      }
    },
    l_addNewTreeNode (parentNode) {
      const data = {}
      data[this.props.label] = ''
      data[this.props.parent] = parentNode ? parentNode[this.dataKey] : null
      data.isNew = true
      data[this.props.children] = []
      data[this.dataKey] = uuid.v1()
      if (parentNode) {
        parentNode.data.children.unshift(data)
      } else {
        data.isRoot = true
        this.dataLocal || (this.dataLocal = [])
        this.dataLocal.push(data)
      }
      this.$nextTick(() => {
        this.tempNodeLabel = ''
        this.$refs['slot-tree-input-' + data[this.dataKey]].focus()
        this.isEditing = true
      })
    },
    l_deleteNodeFromTree (node) {
      node.parent.removeChild(node) // 同级节点
      this.isEditing = false
    },
    e_nodeAdd (node) { // 新增节点
      this.l_stopEventPop()
      // console.log('新增节点', node)
      // 1确保节点展开
      if (!node.expanded) {
        node.expanded = true
      }
      if (this.addInner) {
        this.l_addNewTreeNode(node)
      } else {
        this.$emit('add', node.data)
      }
    },
    e_inputClick (node) {
      this.l_stopEventPop()
    }
  }
}
</script>

<style lang="stylus" rel="stylesheet/stylus">
  @import '../../views/theme.styl'

  common-tree-node-height = 28px

  common-css()
    .el-button
      height common-tree-node-height - 4
      width 20px
      background-color unset
      border unset
      color black
      padding 0 3px
      &:hover
        color highlight-text-color
        box-shadow unset
      & + .el-button
        margin-left 4px
      i
        margin-bottom 19px
        vertical-align middle
        color #a6a5c1
        &:hover
          color hover-background-color
    .el-input
      .el-input__inner
        height common-tree-node-height + 2
        line-height common-tree-node-height + 2
        font-size 16px
        padding-left 6px

  .tree-wrapper
    width 100%
    height 100%
    position relative
    > .add-button
      position absolute
      left calc(50% - 50px)
      bottom 0
      text-align center
    > .expand-el-tree
      border none
      margin-top 10px
      height calc(100% - 90px)
      width 100%
      overflow auto
      .el-tree-node
        position relative
        margin 2px 0
        .el-tree-node__content
          height common-tree-node-height
          line-height common-tree-node-height
          padding unset !important
          .el-tree-node__expand-icon
            display none
          .slot-t-node
            position relative
            common-css()
            span
              display inline-block
            .slot-t-node--label
              padding 0 8px
              border-radius 5px
            .slot-t-icons
              margin-left 10px
              font-weight 600
            .icon-expand
              display inline-block
              img
                vertical-align middle
                height 18px
          &:hover
            background-color unset
            .slot-t-node--label
              background-color hover-other-background-color
              color hover-other-text-color
        .el-tree-node__children
          overflow unset
          margin-left 40px
          > .el-tree-node
            &:not(:last-child)
              &::before
                position absolute
                left 8.5px
                top 20px
                width 1px
                height calc(100% - 10px)
                border-left 1px dashed #d1d1d1
                content ' '
      .is-current
        & > .el-tree-node__content
          background-color unset
          .slot-t-node--label
            background-color active-background-color
            color active-text-color
        &:hover
          & > .el-tree-node__content
            background-color unset
            .slot-t-node--label
              background-color active-background-color
              color active-text-color
</style>
