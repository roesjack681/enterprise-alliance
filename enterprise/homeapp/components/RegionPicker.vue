<template>
  <u-picker
    keyName="name"
    :show="show"
    :columns="columns"
    v-model="selectedIndexes"
    ref="uPicker"
    @confirm="onConfirm"
    @change="onChange"
    @cancel="onCancel"
  />
</template>

<script>
import {
  getProvinceList,
  getCityList,
  getAreaList,
  getTownList
} from '@/utils/api';

export default {
  name: "RegionPicker",
  props: {
    show: Boolean,
    provinceCode: String,
    selectedValues: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      columns: [[], [], [], []],
      selectedIndexes: [0, 0, 0, 0],
      provinceList: [],
      cityList: [],
      areaList: [],
      townList: []
    };
  },
  watch: {
    show(val) {
      if (val) this.initColumns();
    },
	selectedValues: {
	    handler(val) {
	      if (val && val.length > 0) {
	        this.initColumns();
	      }
	    },
	    immediate: true, // 如果你希望组件创建时也自动触发
	    deep: true       // 如果 `selectedValues` 是一个嵌套数组，建议加上
	}
  },
  methods: {
    async initColumns() {
      try {
        // 获取省
		
        const provinceList = (await getProvinceList()).data || [];
        this.provinceList = provinceList;
        const provinceIndex = provinceList.findIndex(p => p.id == this.selectedValues[0]); 
        this.selectedIndexes[0] = provinceIndex|| 0;  
        const provinceCode = provinceList[this.selectedIndexes[0]]?.province; 
        // 获取市
        const cityList = (await getCityList({ provinceCode })).data || [];
        this.cityList = cityList;
        const cityIndex = cityList.findIndex(c => c.id === this.selectedValues[1]);
        this.selectedIndexes[1] = cityIndex >= 0 ? cityIndex : 0;
        const cityCode = cityList[this.selectedIndexes[1]]?.city;

        // 获取区
        const areaList = (await getAreaList({ provinceCode, cityCode })).data || [];
        this.areaList = areaList;
        const areaIndex = areaList.findIndex(a => a.id === this.selectedValues[2]);
        this.selectedIndexes[2] = areaIndex >= 0 ? areaIndex : 0;
        const areaCode = areaList[this.selectedIndexes[2]]?.district;

        // 获取街道
        const townList = (await getTownList({ provinceCode, cityCode, areaCode })).data || [];
        this.townList = townList;
        const townIndex = townList.findIndex(t => t.id === this.selectedValues[3]);
        this.selectedIndexes[3] = townIndex >= 0 ? townIndex : 0;
		
		this.$refs.uPicker.setIndexs(this.selectedIndexes);
        this.columns = [provinceList, cityList, areaList, townList];
		
		
		this.$emit("confirm", {
		  selectedValues: this.selectedValues,
		  selectedNames: [provinceList[this.selectedIndexes[0]]?.name, cityList[this.selectedIndexes[1]]?.name, areaList[this.selectedIndexes[2]]?.name, townList[this.selectedIndexes[3]]?.name]
		});
		
      } catch (e) {
        console.error('initColumns error', e);
        this.columns = [[], [], [], []];
        this.selectedIndexes = [0, 0, 0, 0];
      }
    },
    async onChange({ columnIndex, index }) {
      try {
        if (columnIndex === 0) {
          const province = this.provinceList[index];
          const cityList = (await getCityList({ provinceCode: province.province })).data || [];
          const areaList = (await getAreaList({ provinceCode: province.province, cityCode: cityList[0]?.city })).data || [];
          const townList = (await getTownList({
            provinceCode: province.province,
            cityCode: cityList[0]?.city,
            areaCode: areaList[0]?.district
          })).data || [];

          this.cityList = cityList;
          this.areaList = areaList;
          this.townList = townList;

          this.columns = [this.provinceList, cityList, areaList, townList];
          this.selectedIndexes = [index, 0, 0, 0];

        } else if (columnIndex === 1) {
          const provinceCode = this.provinceList[this.selectedIndexes[0]]?.province;
          const city = this.cityList[index];
          const areaList = (await getAreaList({ provinceCode, cityCode: city.city })).data || [];
          const townList = (await getTownList({
            provinceCode,
            cityCode: city.city,
            areaCode: areaList[0]?.district
          })).data || [];

          this.areaList = areaList;
          this.townList = townList;

          this.columns = [this.provinceList, this.cityList, areaList, townList];
          this.selectedIndexes[1] = index;
          this.selectedIndexes[2] = 0;
          this.selectedIndexes[3] = 0;

        } else if (columnIndex === 2) {
          const provinceCode = this.provinceList[this.selectedIndexes[0]]?.province;
          const cityCode = this.cityList[this.selectedIndexes[1]]?.city;
          const area = this.areaList[index];
          const townList = (await getTownList({
            provinceCode,
            cityCode,
            areaCode: area.district
          })).data || [];
		  this.$refs.uPicker.setColumnValues(3, townList);	  
          this.townList = townList;
          this.columns[3] = townList;
          this.selectedIndexes[2] = index;
          this.selectedIndexes[3] = 0;
		  
        } else if (columnIndex === 3) {
          this.selectedIndexes[3] = index;
        }
		this.$refs.uPicker.setIndexs(this.selectedIndexes);
      } catch (e) {
        console.error('onChange error', e);
      }
    },
    onConfirm() {
      const getItem = (list, idx) => list[idx] || {};
      const province = getItem(this.provinceList, this.selectedIndexes[0]);
      const city = getItem(this.cityList, this.selectedIndexes[1]);
      const area = getItem(this.areaList, this.selectedIndexes[2]);
      const town = getItem(this.townList, this.selectedIndexes[3]);

      this.$emit("confirm", {
        selectedValues: [province.id, city.id, area.id, town.id],
        selectedNames: [province.name, city.name, area.name, town.name]
      });

      this.$emit("update:show", false);
    },
    onCancel() {
      this.$emit("update:show", false);
    }
  }
};
</script>
