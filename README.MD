基于ElementUI的树形组件。

# select-tree 选择树
支持拖动，搜索，点击，直接编辑，新增
```html
<edit-tree
	:data="departmentTreeData"
	name="部门"
	@add="e_nodeAdd"
 	@delete="e_nodeDelete"
	@update="e_nodeUpdate"
	@click="e_nodeClick"
	@move="e_nodeUpdate">
</edit-tree>
```
![Jietu20190525103408.jpg](https://www.tobesimple.top/api/file/2019/05/25/10/34/58/5a7f5e9e-af49-4bdc-9e26-ef5c8faaca91.jpg)
![image.png](https://www.tobesimple.top/api/file/2020/04/19/14/01/09/1a68e8a1-0300-4e5c-afc7-9977a79d18fb.png)

# single-tree-select 下拉单选树
支持节点区分，外部点击自动消失，自适应大小
```html
<single-tree-select
     v-model="personForm.department"
     :placeholder="departmentPlaceholder"
     :data="departmentTreeData">
</single-tree-select>
```
![image.png](https://www.tobesimple.top/api/file/2020/04/19/14/00/42/32cdbf96-7969-4262-b102-1d0d58dc2c15.png)

# multi-tree-select 下拉多选树
支持节点区分，外部点击自动消失，自适应大小
```html
<multi-tree-select
   v-model="personForm.departmentsManaged"
   :data="departmentTreeData">
</multi-tree-select>
```
![image.png](https://www.tobesimple.top/api/file/2020/04/19/14/03/22/0de955c1-f8ab-4bd3-a24b-fd387be9df2f.png)
