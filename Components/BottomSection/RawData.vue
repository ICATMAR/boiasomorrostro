<template>
  <div class="content">

    <!-- Loading spinner -->
    <div v-if="isLoading" class="loading">Loading...</div>

    <!-- Table display -->
    <table v-if="data.length" class="csv-table">
      <thead>
        <tr>
          <!-- Dynamically generate table headers based on the first row of CSV -->
          <th v-for="(column, index) in headers" :key="index">{{ column }}</th>
        </tr>
      </thead>
      <tbody>
        <!-- Loop through the rows of CSV data -->
        <tr v-for="(row, rowIndex) in data" :key="rowIndex">
          <td v-for="(value, colIndex) in row" :key="colIndex">{{ value }}</td>
        </tr>
      </tbody>
    </table>

    <!-- Message when there is no data -->
    <div v-if="!data.length && !isLoading">No data available.</div>


  </div>
</template>




<script>
export default {
  name: "CSVTable",
  data() {
    return {
      data: [], // Holds the CSV data
      headers: [], // Holds the CSV header row
      isLoading: true, // Flag to indicate loading state
    };
  },
  mounted() {
    this.fetchCSVData();
  },
  methods: {
    async fetchCSVData() {
      try {
        const response = await fetch("https://icatmar.github.io/BuoyData/Somorrostro/csv/BuoySomorrostro_2024_11.csv"); // Replace with your CSV URL
        const csvText = await response.text();
                
        let tmp = csvText.replace('\r', '');
        this.headers = tmp.split('\n')[0].split(',');
        tmp = tmp.split('\n');
        tmp.shift();
        tmp.pop();
        let data = [];
        for (let i = 0; i < tmp.length; i++){
          data[i] = tmp[i].split(',');
        }
        this.data = data;

        this.isLoading = false;
      
      } catch (error) {
        console.error("Error fetching or parsing CSV:", error);
        this.loading = false;
      }
    },
  },
};
</script>




<style scoped>
.content {
  padding: 20px;
  overflow: auto;
  font-size: small;
  max-width: 700px;
  max-height: 100%;
}

.csv-table th,
.csv-table td {
  padding: 10px;
  border: 1px solid #ccc;
  text-align: left;
}

.csv-table th {
  background-color: #f4f4f4;
  position: sticky; /* Make the header sticky */
  top: 0; /* Stick to the top of the table wrapper */
  z-index: 1; /* Ensure the header is above the table rows */
}
</style>