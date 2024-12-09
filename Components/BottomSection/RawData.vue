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
          <td class="sticky-first-column">{{ row[0] }}</td> <!-- Sticky first column -->
          <td v-for="(value, colIndex) in row.slice(1)" :key="colIndex">{{ value }}</td> <!-- Other columns -->
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
  margin: min(20px, 2vw);
  overflow: auto;
  font-size: small;
  max-width: 60vw;
  max-height: 90%;
}

.csv-table th,
.csv-table td {
  padding: min(10px, 1vw);
  border: 1px solid gray;
  text-align: left;
}

.csv-table th {
  background-color: var(--lightBlue);
  position: sticky; /* Make the header sticky */
  top: 0; /* Stick to the top of the table wrapper */
  z-index: 2; /* Ensure the header is above the table rows */
}

/* Sticky first column */
.sticky-first-column {
  position: sticky;
  left: 0; /* Stick to the left side of the table */
  background-color: var(--lightBlue);
  z-index: 1; /* Make sure the first column stays on top of the other columns */
  font-weight: bold; /* Optional: Make the first column text bold for better visibility */
}
</style>