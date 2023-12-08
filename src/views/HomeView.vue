<template>
  <div class="home">
    <GoogleMap
      api-key="AIzaSyB3IARJadJGuepw1HrNWV_2N42L6rwvvdc"
      style="width: 100vw; height: 100vh"
      :center="center"
      :zoom="15"
      map-type-id="roadmap"
      :options="{
        streetViewControl: false,
        mapTypeControl: false,
        zoomControl: false,
        fullscreenControl: false,
      }"
    >
      <CustomMarker :options="{ position: center }">
        <div style="text-align: center">
          <img
            src="../assets/icons/target.png"
            width="30"
            height="30"
            style="margin-top: 8px"
            class="icon-dot"
          />
        </div>
      </CustomMarker>

      <Polyline
        v-if="selectedRouteId && sortedDotsForLine.length > 1"
        :options="{
          path: sortedDotsForLine.map((dot) => ({
            lat: dot.lat,
            lng: dot.lng,
          })),
          strokeColor: '#49f051',
          strokeOpacity: 1.0,
          strokeWeight: 3,
        }"
      />

      <template v-if="sortedDotsForLine.length > 0">
        <template v-for="vehicle in transport" :key="vehicle.id">
          <CustomMarker
            :options="{ position: { lat: vehicle.lat, lng: vehicle.lng } }"
          >
            <div style="text-align: center">
              <img
                :src="getCategoryIcon(vehicle.categoryTransport)"
                width="30"
                height="30"
                style="margin-top: 8px"
                class="icon-transport icon-transport"
              />
            </div>
          </CustomMarker>
        </template>
      </template>

      <template v-for="busStop in busStops" :key="busStop.id">
        <CustomMarker
          :options="{
            position: { lat: busStop.lat, lng: busStop.lng },
            icon: 'url/to/your/icon.png',
          }"
          @click="() => showRoutesForBusStop(busStop.id)"
        >
          <div style="text-align: center">
            <img
              src="../assets/icons/bus.png"
              width="40"
              height="40"
              style="margin-top: 8px"
              class="icon-stop"
            />
          </div>
        </CustomMarker>
      </template>
    </GoogleMap>
    <div class="main-island">
      <div v-if="categories.length" class="category-grid">
        <div
          v-for="category in categories"
          :key="category.id"
          class="category-tile"
          @click="showRoutesForCategory(category.id)"
        >
          <img
            :src="category.iconCategory"
            alt="Category Icon"
            class="category-icon"
          />
          <p>{{ category.nameCategory }}</p>
        </div>
      </div>
      <div v-if="selectedCategoryRoutes.length" class="category-routes">
        <div v-for="route in selectedCategoryRoutes" :key="route.id">
          <div class="row-det" @click="showRouteDetails(route)">
            <div class="route-num">
              <img
                :src="getCategoryIcon(currentCategoryId)"
                class="route-icon"
              />
              <p class="route-det">{{ route.numberRouter }}</p>
            </div>
            <p class="route-det det-int">Інтервал {{ route.interval }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="selectedBusStop" class="second-island category-routes">
      <p class="stop-name">{{ selectedBusStop.busStopName }}</p>
      <img
        src="../assets/icons/close.png"
        class="close-stop"
        @click="closeBusStopDetails"
      />
      <div
        v-for="route in routesForBusStop"
        :key="route.id"
        @click="showRouteDetails(route)"
      >
        <div class="row-det">
          <div class="route-num">
            <img :src="getCategoryIcon(route.categoryId)" class="route-icon" />
            <p class="route-det">{{ route.numberRouter }}</p>
          </div>
          <p class="route-det det-int">Інтервал: {{ route.interval }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, onMounted } from "vue";
import { GoogleMap, CustomMarker, Polyline } from "vue3-google-map";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  getDoc,
  doc,
} from "firebase/firestore";

export default defineComponent({
  components: { GoogleMap, CustomMarker, Polyline },
  setup() {
    const center = ref({ lat: 0, lng: 0 });
    const busStops = ref([]);
    const selectedBusStop = ref(null);
    const routesForBusStop = ref([]);
    const categories = ref([]);
    const selectedCategory = ref(null);
    const selectedCategoryRoutes = ref([]);
    const currentCategoryId = ref(null);
    const transport = ref([]);
    const selectedRouteId = ref(null);
    const selectedRouteData = ref({
      // ... your other properties
      stops: [], // Initialize stops array
    });
    const busStopNames = ref({});
    const dotsForLine = ref([]);
    const sortedDotsForLine = ref([]);

    let timerInterval = 0;

    function sleep(ms) {
      return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function changeInterval() {
      await sleep(10);
      timerInterval = 10000;
      console.log("timerInterval змінено на 20000");
      console.log("timerInterval =", timerInterval);
    }

    async function logTimerInterval() {
      await changeInterval();
      console.log("timerInterval =", timerInterval);
    }

    // Call the function to log the timerInterval value
    logTimerInterval();

    const startTransportUpdate = async () => {
      // Fetch initial transport data
      await fetchTransportData();
      await fetchDotsForLine();

      const vehicleIndices = {};

      const updateTransportPositions = () => {
        transport.value.forEach((vehicle) => {
          if (!(vehicle.id in vehicleIndices)) {
            vehicleIndices[vehicle.id] = {
              index: Math.floor(Math.random() * sortedDotsForLine.value.length),
              direction: 1, // Initial direction
            };
          }

          let { index, direction } = vehicleIndices[vehicle.id];

          if (sortedDotsForLine.value.length > 0) {
            console.log(
              `Vehicle ${vehicle.id} position:`,
              vehicle.lat,
              vehicle.lng
            );

            // Ensure the index is within the valid range
            index =
              (index + sortedDotsForLine.value.length) %
              sortedDotsForLine.value.length;

            vehicle.lat = sortedDotsForLine.value[index].lat;
            vehicle.lng = sortedDotsForLine.value[index].lng;

            console.log(
              `Updated Vehicle ${vehicle.id} position:`,
              vehicle.lat,
              vehicle.lng
            );

            // Check if the vehicle is at the endpoint and reverse the direction
            if (index === 0 || index === sortedDotsForLine.value.length - 1) {
              direction *= -1;
            }

            // Increment or decrement the index based on the direction
            index += direction;

            // Update the index and direction in the vehicleIndices object
            vehicleIndices[vehicle.id] = { index, direction };
          }
        });
      };

      // Set interval to update positions
      setInterval(updateTransportPositions, timerInterval);

      // Initial update
      updateTransportPositions();
    };

    const closeBusStopDetails = () => {
      // Reset the selectedBusStop and routesForBusStop
      selectedBusStop.value = null;
      routesForBusStop.value = [];
    };

    const routesCollection = collection(getFirestore(), "routes");
    const fetchBusStops = async () => {
      const db = getFirestore();
      const busStopsCollection = collection(db, "busStops");
      const busStopsSnapshot = await getDocs(busStopsCollection);

      busStops.value = busStopsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Bus Stops:", busStops.value);

      const categoriesCollection = collection(db, "categories");
      const categoriesSnapshot = await getDocs(categoriesCollection);

      categories.value = categoriesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log("Categories:", categories.value);
    };

    const fetchDotsForLine = async () => {
      try {
        const db = getFirestore();
        const dotsForLineCollection = collection(db, "dotsForLine");
        const dotsForLineSnapshot = await getDocs(dotsForLineCollection);

        dotsForLine.value = dotsForLineSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        console.log("Dots For Line:", dotsForLine.value);

        // Sort dotsForLine based on ID
        sortedDotsForLine.value = dotsForLine.value
          .slice()
          .sort((a, b) => a.id - b.id);

        console.log("Sorted Dots For Line:", sortedDotsForLine.value);
      } catch (error) {
        console.error("Error fetching dotsForLine:", error);
      }
    };

    const getRandomCoordinate = () => {
      // Ensure sortedDotsForLine is not empty
      if (sortedDotsForLine.value.length > 0) {
        const randomIndex = Math.floor(
          Math.random() * sortedDotsForLine.value.length
        );
        return {
          lat: sortedDotsForLine.value[randomIndex].lat,
          lng: sortedDotsForLine.value[randomIndex].lng,
        };
      } else {
        // If sortedDotsForLine is empty, return default coordinates
        return { lat: 0, lng: 0 };
      }
    };

    const fetchTransportData = async () => {
      try {
        const transportCollection = collection(getFirestore(), "transport");
        const transportSnapshot = await getDocs(transportCollection);

        transport.value = transportSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          ...getRandomCoordinate(),
        }));

        // Log the transport data for debugging
        console.log("Transport Data:", transport.value);
      } catch (error) {
        console.error("Error fetching transport data:", error);
      }
    };

    const getBusStopName = async (stopId) => {
      // Check if the bus stop name is already fetched
      if (busStopNames.value[stopId]) {
        return busStopNames.value[stopId];
      }

      try {
        const busStopDoc = await getDoc(
          doc(collection(getFirestore(), "busStops"), stopId)
        );

        if (busStopDoc.exists()) {
          const busStopData = busStopDoc.data();
          const busStopName = busStopData.busStopName;
          // Update the reactive property
          busStopNames.value[stopId] = busStopName;
          return busStopName;
        } else {
          console.error(`Bus stop with ID ${stopId} not found`);
          return "Unknown Stop";
        }
      } catch (error) {
        console.error("Error fetching bus stop information:", error);
        return "Error Loading Stop";
      }
    };

    const showRoutesForCategory = async (categoryId) => {
      try {
        console.log("Category ID:", categoryId);

        const routesSnapshot = await getDocs(
          query(routesCollection, where("categoryId", "==", categoryId))
        );

        currentCategoryId.value = categoryId;
        selectedCategoryRoutes.value = routesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
      } catch (error) {
        console.error("Error fetching routes for category:", error);
      }
    };

    const getCategoryIcon = (categoryId) => {
      const selectedCategory = categories.value.find(
        (cat) => cat.id === categoryId
      );
      return selectedCategory ? selectedCategory.iconCategory : "";
    };

    onMounted(() => {
      startTransportUpdate();
      fetchTransportData();
      fetchDotsForLine();
      // Отримати геолокацію користувача
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            center.value = {
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            };
          },
          (error) => {
            console.error("Error Code = " + error.code + " - " + error.message);
          }
        );
      } else {
        alert("Geolocation is not supported by this browser.");
      }

      // Завантажити зупинки з Firestore
      fetchBusStops();
    });
    // onUnmounted(() => {
    //   stopTransportUpdate();
    // });

    return {
      center,
      busStops,
      routesCollection,
      selectedBusStop,
      routesForBusStop,
      categories,
      showRoutesForCategory,
      selectedCategory,
      selectedCategoryRoutes,
      currentCategoryId,
      getCategoryIcon,
      selectedRouteData,
      isRouteDetailsVisible: ref(false),
      getBusStopName,
      busStopNames,
      dotsForLine,
      sortedDotsForLine,
      closeBusStopDetails,
      transport,
      startTransportUpdate,
      timerInterval,
      selectedRouteId,
    };
  },
  methods: {
    async showRoutesForBusStop(busStopId) {
      try {
        const busStopRef = doc(getFirestore(), "busStops", busStopId);
        const busStopDoc = await getDoc(busStopRef);

        if (busStopDoc.exists()) {
          this.selectedBusStop = {
            id: busStopDoc.id,
            ...busStopDoc.data(),
          };

          // Отримати маршрути для вибраної зупинки
          const routesSnapshot = await getDocs(
            query(
              this.routesCollection,
              where("stops", "array-contains", busStopId)
            )
          );

          this.routesForBusStop = routesSnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
        } else {
          console.error("Bus stop not found");
        }
      } catch (error) {
        console.error("Error fetching routes for bus stop:", error);
      }
    },

    async showRouteDetails(route) {
      try {
        // ... existing code

        // Set the selected route
        this.selectedRouteId = route.id;
      } catch (error) {
        console.error("Error fetching route details:", error);
      }
    },
  },
});
</script>

<style>
.icon-dot {
  animation: pulse 2s infinite;
  border-radius: 50%;
}
@keyframes pulse {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0.7);
  }

  70% {
    transform: scale(1);
    box-shadow: 0 0 0 10px rgba(0, 0, 0, 0);
  }

  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 0, 0, 0);
  }
}
.window-routes {
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100vh;
  background-color: #fff;
  z-index: 1;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
}
.main-island {
  padding: 10px;
  position: absolute;
  z-index: 95;
  top: 10px;
  right: 15px;
  background-color: #474747;
  width: 300px;
  border-radius: 5px;
  overflow: hidden;
  transition: max-height 0.5s ease; /* Adjust the transition duration as needed */
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}

.category-grid {
  display: grid;
  grid-template-columns: repeat(
    auto-fill,
    minmax(85px, 1fr)
  ); /* Adjusted here */
  gap: 7px;
}
.category-grid p {
  color: #fff;
  font-size: 12px;
  margin-top: 5px;
  margin-bottom: 0;
  font-family: "Rubik", sans-serif;
}

.category-tile {
  text-align: center;
  padding: 10px;
  border-radius: 5px;
  background-color: #333333;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
  cursor: pointer;
}

.category-icon {
  width: 30px;
  object-fit: contain;
}
.category-routes {
  display: flex;
  flex-direction: column;
  cursor: pointer;
  margin-top: 10px;
  gap: 5px;
}
.row-det {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-radius: 5px;
  background-color: #333333;
}
.route-num {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 7px;
  font-size: 17px;
}
.route-det {
  color: #fff;
  margin-top: 5px;
  margin-bottom: 0;
  font-family: "Rubik", sans-serif;
}
.route-icon {
  width: 20px;
  object-fit: contain;
}
.det-int {
  font-size: 12px;
}
.second-island {
  padding: 10px;
  position: absolute;
  z-index: 95;
  bottom: 10px;
  right: 15px;
  background-color: #474747;
  width: 300px;
  border-radius: 5px;
  overflow: hidden;
  transition: max-height 0.5s ease;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}
.stop-name {
  color: #f6c53e;
  font-size: 19px;
  margin-top: 5px;
  margin-bottom: 0;
  font-family: "Rubik", sans-serif;
  text-align: center;
  margin-bottom: 10px;
}
.close-stop {
  width: 20px;
  object-fit: contain;
  position: absolute;
  top: 15px;
  right: 20px;
  cursor: pointer;
}
.back-show-route {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  backdrop-filter: brightness(0.5) blur(5px);
  z-index: 15;
}
.show-route {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 500px;
  background-color: #474747;
  z-index: 1;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.5);
  border-radius: 5px;
}
.titile-route {
  color: #f6c53e;
  font-size: 19px;
  margin-top: 5px;
  margin-bottom: 0;
  font-family: "Rubik", sans-serif;
  text-align: center;
  margin-bottom: 10px;
}
.icon-transport {
  height: 15px;
  object-fit: contain;
  background-color: #f6c53e;
  padding: 5px 1px;
  border-radius: 5px;
}
</style>
