import editTreeComponent from './edit-tree.vue'
import singleSelectTreeComponent from './single-select-tree.vue'
import multiSelectTreeComponent from './multi-select-tree.vue'
import popSingleSelectTreeComponent from './single-tree-select.vue'
import popMultiSelectTreeComponent from './multi-tree-select.vue'
import popSingleSelectTreeBoardComponent from './single-tree-select-board.vue'
import './common.styl'

const tree = {
  install: function (Vue) {
    Vue.component(editTreeComponent.name, editTreeComponent)
    Vue.component(singleSelectTreeComponent.name, singleSelectTreeComponent)
    Vue.component(multiSelectTreeComponent.name, multiSelectTreeComponent)
    Vue.component(popSingleSelectTreeComponent.name, popSingleSelectTreeComponent)
    Vue.component(popMultiSelectTreeComponent.name, popMultiSelectTreeComponent)
    Vue.component(popSingleSelectTreeBoardComponent.name, popSingleSelectTreeBoardComponent)
  }
}
export default tree
