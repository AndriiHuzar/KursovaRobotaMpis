<template>
  <div class="admin-panel">
    <div class="type">
      <button class="type-title" @click="showContent('routes')">
        Маршрути
      </button>
      <button class="type-title" @click="showContent('busStops')">
        Зупинки
      </button>
      <button class="type-title" @click="showContent('transport')">ТЗ</button>
    </div>
    <div v-if="activeContent === 'routes'" class="bus-stops-list">
      <h2 class="title-in-list">Список маршрутів</h2>
      <div
        v-for="route in routes"
        :key="route.id"
        class="item-in-list"
        @click="editRoute(route)"
      >
        <img src="../assets/icons/distance-blue.png" class="bus-icon" />
        {{ route.numberRouter }}
      </div>
      <div class="item-in-list" @click="isAddingRoute = true">
        <img src="../assets/icons/add.png" class="bus-icon" />
        Додати маршрут
      </div>
    </div>
    <div v-else-if="activeContent === 'busStops'" class="bus-stops-list">
      <h2 class="title-in-list">Список зупинок</h2>
      <div
        v-for="busStop in busStops"
        :key="busStop.id"
        class="item-in-list"
        @click="editBusStop(busStop)"
      >
        <img src="../assets/icons/bus.png" class="bus-icon" />
        {{ busStop.busStopName }}
      </div>
      <div class="item-in-list" @click="isAddingStop = true">
        <img src="../assets/icons/add.png" class="bus-icon" />
        Додати зупинку
      </div>
    </div>
    <div v-else-if="activeContent === 'transport'" class="bus-stops-list">
      <h2 class="title-in-list">Список ТЗ</h2>

      <div v-for="category in categories" :key="category.id">
        <h3>{{ category.categoryName }}</h3>

        <!-- Виводимо транспорт для кожної категорії -->
        <div
          v-for="transport in getTransportByCategory(category.id)"
          :key="transport.id"
          class="item-in-list"
          @click="editTransport(transport)"
        >
          <img
            :src="getTransportIcon(transport.categoryTransport)"
            class="bus-icon"
          />
          {{ transport.transportName }} - {{ transport.registrationNumber }}
        </div>
      </div>

      <div class="item-in-list" @click="isAddingTransport = true">
        <img src="../assets/icons/add.png" class="bus-icon" />
        Додати ТЗ
      </div>
    </div>
    <div v-if="isEditingStop" class="stop-edit">
      <div class="edit-island">
        <div class="top-edit">
          <h2 class="title-in-list">Редагування зупинки</h2>
          <img
            src="../assets/icons/close.png"
            class="close"
            @click="closeEditing"
          />
        </div>
        <div class="inputs-edit">
          <div class="input-row">
            <p class="label-input">Назва</p>
            <input
              v-model="editedBusStop.busStopName"
              type="text"
              placeholder="Назва зупинки"
              class="e-input"
            />
          </div>
          <div class="input-row">
            <p class="label-input">Широта</p>
            <input
              v-model="editedBusStop.latitude"
              type="text"
              placeholder="Широта"
              class="e-input"
            />
          </div>
          <div class="input-row">
            <p class="label-input">Довгота</p>
            <input
              v-model="editedBusStop.longitude"
              type="text"
              placeholder="Довгота"
              class="e-input"
            />
          </div>
          <div class="row-center">
            <button class="save-changes" @click="saveChanges">
              Зберегти зміни
            </button>
            <button class="remove" @click="deleteStop">Видалити зупинку</button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isAddingStop" class="stop-edit">
      <div class="edit-island">
        <div class="top-edit">
          <h2 class="title-in-list">Додавання зупинки</h2>
          <img
            src="../assets/icons/close.png"
            class="close"
            @click="closeAdding"
          />
        </div>
        <div class="inputs-edit">
          <div class="input-row">
            <p class="label-input">Назва</p>
            <input
              v-model="editedBusStop.busStopName"
              type="text"
              placeholder="Назва зупинки"
              class="e-input"
            />
          </div>
          <div class="input-row">
            <p class="label-input">Широта</p>
            <input
              v-model="editedBusStop.latitude"
              type="text"
              placeholder="Широта"
              class="e-input"
            />
          </div>
          <div class="input-row">
            <p class="label-input">Довгота</p>
            <input
              v-model="editedBusStop.longitude"
              type="text"
              placeholder="Довгота"
              class="e-input"
            />
          </div>
          <div class="row-center">
            <button class="save-changes" @click="addBusStop">
              Додати зупинку
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isEditingRoute" class="stop-edit">
      <div class="edit-island">
        <div class="top-edit">
          <h2 class="title-in-list">Редагування маршруту</h2>
          <img
            src="../assets/icons/close.png"
            class="close"
            @click="closeEditingRoute"
          />
        </div>
        <div class="inputs-edit">
          <div class="input-row">
            <p class="label-input">Номер маршруту</p>
            <input
              v-model="editedRoute.numberRouter"
              type="text"
              placeholder="Номер маршруту"
              class="e-input"
            />
          </div>
          <div class="input-row">
            <p class="label-input">Інтервал руху</p>
            <input
              v-model="editedRoute.interval"
              type="text"
              placeholder="Інтервал руху"
              class="e-input"
            />
          </div>

          <div class="input-row">
            <p class="label-input">Зупинки</p>
            <div class="list-stops">
              <label
                v-for="busStop in busStops"
                :key="busStop.id"
                class="checkbox-label"
              >
                <input
                  type="checkbox"
                  :checked="selectedBusStops.includes(busStop.id)"
                  @change="toggleSelectedBusStop(busStop.id)"
                  class="checkbox-input"
                />

                {{ busStop.busStopName }}
              </label>
            </div>
          </div>

          <div class="input-row">
            <p class="label-input">ТЗ</p>
            <div class="list-stops">
              <label
                v-for="transport in filteredTransports"
                :key="transport.id"
                class="checkbox-label"
              >
                <input
                  type="checkbox"
                  :checked="selectedTransports.includes(transport.id)"
                  @change="toggleSelectedTransport(transport.id)"
                  class="checkbox-input"
                />

                {{ transport.transportName }} -
                {{ transport.registrationNumber }}
              </label>
            </div>
          </div>

          <div class="row-center">
            <button class="save-changes" @click="saveRouteChanges">
              Зберегти зміни
            </button>
            <button class="remove" @click="deleteRoute">
              Видалити маршрут
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isAddingRoute" class="stop-edit">
      <div class="edit-island">
        <div class="top-edit">
          <h2 class="title-in-list">Додавання маршруту</h2>
          <img
            src="../assets/icons/close.png"
            class="close"
            @click="closeAddingRoute"
          />
        </div>
        <div class="inputs-edit">
          <div class="input-row">
            <p class="label-input">Номер маршруту</p>
            <input
              v-model="numberRouter"
              type="text"
              placeholder="Номер маршруту"
              class="e-input"
            />
          </div>
          <div class="input-row">
            <p class="label-input">Інтервал руху</p>
            <input
              v-model="interval"
              type="text"
              placeholder="Інтервал руху"
              class="e-input"
            />
          </div>
          <div class="input-row">
            <p class="label-input">Категорія</p>
            <select v-model="selectedCategory" class="e-input cat-lng">
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.nameCategory }}
              </option>
            </select>
          </div>
          <div class="input-row">
            <p class="label-input">Зупинки</p>
            <div class="list-stops">
              <label
                v-for="busStop in busStops"
                :key="busStop.id"
                class="checkbox-label"
              >
                <input
                  type="checkbox"
                  :checked="selectedBusStops.includes(busStop.id)"
                  @change="toggleSelectedBusStop(busStop.id)"
                  class="checkbox-input"
                />
                {{ busStop.busStopName }}
              </label>
            </div>
          </div>
          <div class="row-center">
            <button class="save-changes" @click="addRoute">
              Додати маршрут
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isEditingTransport" class="stop-edit">
      <div class="edit-island">
        <div class="top-edit">
          <h2 class="title-in-list">Редагування ТЗ</h2>
          <img
            src="../assets/icons/close.png"
            class="close"
            @click="closeEditingTransport"
          />
        </div>
        <div class="inputs-edit">
          <div class="input-row">
            <p class="label-input">Назва ТЗ</p>
            <input
              v-model="editedTransport.transportName"
              type="text"
              placeholder="Назва ТЗ"
              class="e-input"
            />
          </div>
          <div class="input-row">
            <p class="label-input">№ реєстрації</p>
            <input
              v-model="editedTransport.registrationNumber"
              type="text"
              placeholder="Реєстраційни номер"
              class="e-input"
            />
          </div>
          <div class="row-center">
            <button class="save-changes" @click="saveTransportChanges">
              Зберегти зміни
            </button>
            <button class="remove" @click="deleteTransport">
              Видалити ТЗ
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="isAddingTransport" class="stop-edit">
      <div class="edit-island">
        <div class="top-edit">
          <h2 class="title-in-list">Додавання ТЗ</h2>
          <img
            src="../assets/icons/close.png"
            class="close"
            @click="closeAddingTransport"
          />
        </div>
        <div class="inputs-edit">
          <div class="input-row">
            <p class="label-input">Назва ТЗ</p>
            <input
              v-model="editedTransport.transportName"
              type="text"
              placeholder="Назва ТЗ"
              class="e-input"
            />
          </div>
          <div class="input-row">
            <p class="label-input">№ реєстрації</p>
            <input
              v-model="editedTransport.registrationNumber"
              type="text"
              placeholder="Реєстраційний номер"
              class="e-input"
            />
          </div>
          <div class="input-row">
            <p class="label-input">Категорія</p>
            <select
              v-model="editedTransport.categoryTransport"
              class="e-input cat-lng"
            >
              <option
                v-for="category in categories"
                :key="category.id"
                :value="category.id"
              >
                {{ category.nameCategory }}
              </option>
            </select>
          </div>
          <div class="row-center">
            <button class="save-changes" @click="addTransport">
              Додати ТЗ
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
} from "firebase/firestore";

// Реактивні об'єкти
const busStops = ref([]);
const routes = ref([]);
const isEditingStop = ref(false);
const isAddingStop = ref(false);
const editedBusStop = ref({
  busStopName: "",
  latitude: "",
  longitude: "",
});
const isEditingRoute = ref(false);
const isAddingRoute = ref(false);
const editedRoute = ref({
  numberRouter: "",
  interval: "",
  stops: [],
  transports: [],
});
const numberRouter = ref("");
const interval = ref("");
const categories = ref([]);
const selectedBusStops = ref([]);
const selectedTransports = ref([]);
const activeContent = ref("routes");
const selectedCategory = ref(null);
const transports = ref([]);
const isEditingTransport = ref(false);
const isAddingTransport = ref(false);
const filteredTransports = ref([]);
const editedTransport = ref({
  transportName: "",
  registrationNumber: "",
  categoryTransport: null,
});

// Функція: Показати вміст (маршрути або зупинки)
const showContent = (contentType) => {
  activeContent.value = contentType;
};

// Функція: Вибір або скасування вибору зупинки
const toggleSelectedBusStop = (busStopId) => {
  const index = selectedBusStops.value.indexOf(busStopId);
  if (index !== -1) {
    selectedBusStops.value.splice(index, 1);
  } else {
    selectedBusStops.value.push(busStopId);
  }
};

// Функція: Вибір або скасування вибору транспортного засобу
const toggleSelectedTransport = (transportId) => {
  const index = selectedTransports.value.indexOf(transportId);
  if (index !== -1) {
    selectedTransports.value.splice(index, 1);
  } else {
    selectedTransports.value.push(transportId);
  }
};

// Функція: Отримання іконки транспортного засобу за його категорією
const getTransportIcon = (category) => {
  const categoryDoc = categories.value.find((cat) => cat.id === category);
  if (categoryDoc) {
    return categoryDoc.iconCategory;
  } else {
    return "../assets/icons/default.png";
  }
};

// Функція: Отримання транспорту за категорією
const getTransportByCategory = (categoryId) => {
  return transports.value
    .filter((transport) => transport.categoryTransport === categoryId)
    .sort((a, b) => a.transportName.localeCompare(b.transportName));
};

// Функція: Редагування інформації про транспорт
const editTransport = (transport) => {
  isEditingTransport.value = true;
  editedTransport.value = {
    transportName: transport.transportName,
    registrationNumber: transport.registrationNumber,
    categoryTransport: transport.categoryTransport,
    id: transport.id,
  };
};

// Функція: Збереження змін у транспорті
const saveTransportChanges = async () => {
  try {
    const db = getFirestore();
    const transportDocRef = doc(db, "transport", editedTransport.value.id);

    // Оновлення даних в системі реактивності Vue
    const updatedTransportIndex = transports.value.findIndex(
      (transport) => transport.id === editedTransport.value.id
    );
    transports.value[updatedTransportIndex] = {
      id: editedTransport.value.id,
      transportName: editedTransport.value.transportName,
      registrationNumber: editedTransport.value.registrationNumber,
      categoryTransport: editedTransport.value.categoryTransport,
    };

    // Оновлення даних в Firestore
    await updateDoc(transportDocRef, {
      transportName: editedTransport.value.transportName,
      registrationNumber: editedTransport.value.registrationNumber,
      categoryTransport: editedTransport.value.categoryTransport,
    });

    closeEditingTransport();
    console.log("Зміни у транспорті успішно збережено!");
  } catch (error) {
    console.error("Помилка під час збереження змін у транспорті:", error);
  }
};

const deleteRoute = async () => {
  try {
    const db = getFirestore();
    const routeDocRef = doc(db, "routes", editedRoute.value.id);

    // Delete the route in Firestore
    await deleteDoc(routeDocRef);

    // Remove the route from the local array
    const deletedRouteIndex = routes.value.findIndex(
      (route) => route.id === editedRoute.value.id
    );
    routes.value.splice(deletedRouteIndex, 1);

    closeEditingRoute();
    console.log("Маршрут успішно видалено!");
  } catch (error) {
    console.error("Помилка при видаленні маршруту:", error);
  }
};

const deleteStop = async () => {
  try {
    const db = getFirestore();
    const busStopDocRef = doc(db, "busStops", editedBusStop.value.id);

    // Delete the bus stop in Firestore
    await deleteDoc(busStopDocRef);

    // Remove the bus stop from the local array
    const deletedBusStopIndex = busStops.value.findIndex(
      (busStop) => busStop.id === editedBusStop.value.id
    );
    busStops.value.splice(deletedBusStopIndex, 1);

    closeEditing();
    console.log("Зупинку успішно видалено!");
  } catch (error) {
    console.error("Помилка при видаленні зупинки:", error);
  }
};

const deleteTransport = async () => {
  try {
    const db = getFirestore();
    const transportDocRef = doc(db, "transport", editedTransport.value.id);

    // Delete the transport in Firestore
    await deleteDoc(transportDocRef);

    // Remove the transport from the local array
    const deletedTransportIndex = transports.value.findIndex(
      (transport) => transport.id === editedTransport.value.id
    );
    transports.value.splice(deletedTransportIndex, 1);

    closeEditingTransport();
    console.log("Транспорт успішно видалено!");
  } catch (error) {
    console.error("Помилка при видаленні транспорту:", error);
  }
};

// Функція: Додавання нового транспорту
const addTransport = async () => {
  try {
    const db = getFirestore();
    const transportCollection = collection(db, "transport");

    // Валідація та санітізація введених користувачем даних перед відправленням до Firestore
    const newTransportData = {
      transportName: editedTransport.value.transportName,
      registrationNumber: editedTransport.value.registrationNumber,
      categoryTransport: editedTransport.value.categoryTransport,
    };

    // Додавання нового транспорту в систему реактивності Vue
    transports.value.push({
      id: "temp-id", // Використовуйте тимчасовий ID до того, як його надасть Firestore
      ...newTransportData,
    });

    // Додавання нового транспорту в Firestore
    const addedDocRef = await addDoc(transportCollection, newTransportData);

    // Оновлення транспорту з реальним ID, яке видав Firestore
    const addedTransportIndex = transports.value.findIndex(
      (transport) => transport.id === "temp-id"
    );
    transports.value[addedTransportIndex].id = addedDocRef.id;

    closeAddingTransport();

    console.log("Транспорт успішно додано!");
  } catch (error) {
    console.error("Помилка при додаванні транспорту:", error);
  }
};

// Функція: Закриття режиму редагування транспорту
const closeEditingTransport = () => {
  isEditingTransport.value = false;
  editedTransport.value = {
    transportName: "",
    registrationNumber: "",
    categoryTransport: null,
  };
};

// Функція: Закриття режиму додавання транспорту
const closeAddingTransport = () => {
  isAddingTransport.value = false;
  editedTransport.value = {
    transportName: "",
    registrationNumber: "",
    categoryTransport: null,
  };
};

// Функція: Збереження змін у зупинці
const saveChanges = async () => {
  try {
    const db = getFirestore();
    const busStopDocRef = doc(db, "busStops", editedBusStop.value.id);

    // Оновлення даних в системі реактивності Vue
    const updatedBusStopIndex = busStops.value.findIndex(
      (busStop) => busStop.id === editedBusStop.value.id
    );
    busStops.value[updatedBusStopIndex] = {
      id: editedBusStop.value.id,
      busStopName: editedBusStop.value.busStopName,
      lat: parseFloat(editedBusStop.value.latitude),
      lng: parseFloat(editedBusStop.value.longitude),
    };

    // Оновлення даних в Firestore
    await updateDoc(busStopDocRef, {
      busStopName: editedBusStop.value.busStopName,
      lat: parseFloat(editedBusStop.value.latitude),
      lng: parseFloat(editedBusStop.value.longitude),
    });

    closeEditing();
    console.log("Зміни успішно збережено!");
  } catch (error) {
    console.error("Помилка під час збереження змін:", error);
  }
};

// Функція: Редагування інформації про зупинку
const editBusStop = (busStop) => {
  isEditingStop.value = true;
  editedBusStop.value = {
    busStopName: busStop.busStopName,
    latitude: busStop.lat,
    longitude: busStop.lng,
    id: busStop.id,
  };

  console.log("Редагування зупинки:", busStop);
};

// Функція: Закриття режиму додавання зупинки
const closeAdding = () => {
  isAddingStop.value = false;
  editedBusStop.value = {
    busStopName: "",
    latitude: "",
    longitude: "",
  };
};

// Функція: Додавання нової зупинки
const addBusStop = async () => {
  try {
    const db = getFirestore();
    const busStopsCollection = collection(db, "busStops");

    // Валідація та санітізація введених користувачем даних перед відправленням до Firestore
    const newBusStopData = {
      busStopName: editedBusStop.value.busStopName,
      lat: parseFloat(editedBusStop.value.latitude),
      lng: parseFloat(editedBusStop.value.longitude),
    };

    // Додавання нової зупинки в систему реактивності Vue
    busStops.value.push({
      id: "temp-id", // Використовуйте тимчасовий ID до того, як його надасть Firestore
      ...newBusStopData,
    });

    // Додавання нової зупинки в Firestore
    const addedDocRef = await addDoc(busStopsCollection, newBusStopData);

    // Оновлення зупинки з реальним ID, яке видав Firestore
    const addedBusStopIndex = busStops.value.findIndex(
      (busStop) => busStop.id === "temp-id"
    );
    busStops.value[addedBusStopIndex].id = addedDocRef.id;

    closeAdding();
    console.log("Зупинку успішно додано!");
  } catch (error) {
    console.error("Помилка при додаванні зупинки:", error);
  }
};

// Функція: Закриття режиму редагування зупинки
const closeEditing = () => {
  isEditingStop.value = false;
  editedBusStop.value = {
    busStopName: "",
    latitude: "",
    longitude: "",
  };
};

// Функція: Збереження змін у маршруті
const saveRouteChanges = async () => {
  try {
    const db = getFirestore();
    const routeDocRef = doc(db, "routes", editedRoute.value.id);
    const uniqueStops = [...new Set(selectedBusStops.value)];
    const uniqueTransports = [...new Set(selectedTransports.value)];

    const updatedRouteIndex = routes.value.findIndex(
      (route) => route.id === editedRoute.value.id
    );
    routes.value[updatedRouteIndex] = {
      id: editedRoute.value.id,
      numberRouter: editedRoute.value.numberRouter,
      interval: editedRoute.value.interval,
      stops: uniqueStops,
      transports: uniqueTransports,
    };

    await updateDoc(routeDocRef, {
      numberRouter: editedRoute.value.numberRouter,
      interval: editedRoute.value.interval,
      stops: uniqueStops,
      transports: uniqueTransports,
    });

    closeEditingRoute();
    console.log("Зміни у маршруті успішно збережено!");
  } catch (error) {
    console.error("Помилка при збереженні змін у маршруті:", error);
  }
};

// Функція: Редагування інформації про маршрут
const editRoute = (route) => {
  isEditingRoute.value = true;
  selectedBusStops.value = [...route.stops];
  selectedTransports.value = [...route.transports];
  filteredTransports.value = getTransportByCategory(route.categoryId);
  editedRoute.value = {
    numberRouter: route.numberRouter,
    interval: route.interval,
    stops: route.stops,
    id: route.id,
    transports: selectedTransports.value,
  };

  console.log("Вибране", selectedTransports.value);

  console.log("Редагування маршруту:", route);
};

// Функція: Закриття режиму додавання маршруту
const closeAddingRoute = () => {
  isAddingRoute.value = false;
  editedRoute.value = {
    numberRouter: "",
    interval: "",
    stops: [],
  };
};

const addRoute = async () => {
  try {
    // Отримання доступу до Firestore
    const db = getFirestore();

    // Створення посилання на колекцію маршрутів в Firestore
    const routesCollection = collection(db, "routes");

    // Валідація та санітізація введених користувачем даних перед відправленням до Firestore
    const newRouteData = {
      numberRouter: numberRouter.value,
      interval: interval.value,
      stops: selectedBusStops.value, // Оновіть зупинки обраними автобусними зупинками
      categoryId: selectedCategory.value, // Додайте обраний ID категорії
      transports: selectedTransports.value, // Додайте обрані транспортні засоби
    };

    // Додавання нового маршруту до системи реактивності Vue
    routes.value.push({
      id: "temp-id", // Використовуйте тимчасовий ID до того, як його надасть Firestore
      ...newRouteData,
    });

    // Додавання нового маршруту до Firestore
    const addedDocRef = await addDoc(routesCollection, newRouteData);

    // Оновлення маршруту реальним ID, яке видав Firestore
    const addedRouteIndex = routes.value.findIndex(
      (route) => route.id === "temp-id"
    );
    routes.value[addedRouteIndex].id = addedDocRef.id;

    // Закриття вікна додавання маршруту
    closeAddingRoute();
    console.log("Route added successfully!");
  } catch (error) {
    console.error("Error adding route:", error);
  }
};

const closeEditingRoute = () => {
  // Закриття режиму редагування маршруту
  isEditingRoute.value = false;

  // Скидання значень редагованого маршруту
  editedRoute.value = {
    numberRouter: "",
    interval: "",
    stops: [],
  };
};

// Отримання даних під час завантаження компоненту
onMounted(async () => {
  try {
    const db = getFirestore();

    // Отримання категорій транспорту з Firestore
    const categoriesCollection = collection(db, "categories");
    const categoriesSnapshot = await getDocs(categoriesCollection);

    // Оновлення даних у системі реактивності Vue для категорій
    categories.value = categoriesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("Categories:", categories.value);
  } catch (error) {
    console.error("Error fetching categories:", error);
  }

  const db = getFirestore();

  // Отримання автобусних зупинок з Firestore
  const busStopsCollection = collection(db, "busStops");
  const busStopsSnapshot = await getDocs(busStopsCollection);

  // Оновлення даних у системі реактивності Vue для автобусних зупинок
  busStops.value = busStopsSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Отримання маршрутів з Firestore
  const routesCollection = collection(db, "routes");
  const routesSnapshot = await getDocs(routesCollection);

  // Оновлення даних у системі реактивності Vue для маршрутів
  routes.value = routesSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Вивід у консоль для дебагу
  console.log("Bus Stops:", busStops.value);

  // Отримання даних про транспорт з Firestore
  // Отримання даних про транспорт з Firestore
  const transportCollection = collection(db, "transport");
  const transportSnapshot = await getDocs(transportCollection);

  // Вивід у консоль для дебагу
  console.log("Transport Snapshot:", transportSnapshot);

  // Оновлення даних у системі реактивності Vue для транспорту
  transports.value = transportSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  // Вивід у консоль для дебагу
  console.log("Transports:", transports.value);
});
</script>

<style scoped>
.admin-panel {
  width: 100vw - 80px;
  height: 100vh;
  background: url("https://firebasestorage.googleapis.com/v0/b/kursova-a5f23.appspot.com/o/image.webp?alt=media&token=3b500288-0564-4ddb-a797-e69b79d42883");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

.type {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
  align-items: center;
  width: 40vw;
  margin: 0 auto;
  gap: 40px;
}

.type-title {
  width: 155px;
  height: 35px;
  border-radius: 7px;
  border: none;
  outline: none;
  background-color: #f6c53e;
  font-size: 17px;
  font-family: "Rubik", sans-serif;
  font-weight: 500;
  color: #474747;
  cursor: pointer;
  margin: 40px auto 0 auto;
  transition: ease-in-out 0.1s;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
}

.type-title:active {
  font-size: 15px;
  transition: ease-in-out 0.1s;
}

.bus-stops-list ul {
  list-style-type: none;
  padding: 0;
}

.bus-stops-list li {
  font-size: 16px;
  margin-bottom: 10px;
}
.bus-stops-list {
  margin-top: 20px;
  width: 600px;
  margin: 100px auto 0 auto;
  background-color: #474747;
  padding: 40px 30px;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}
.title-in-list {
  font-size: 21px;
  font-family: "Rubik", sans-serif;
  font-weight: 500;
  color: #f6c53e;
  margin-bottom: 20px;
  text-align: center;
  margin-bottom: 40px;
}
.item-in-list {
  font-size: 15px;
  font-family: "Rubik", sans-serif;
  font-weight: 500;
  color: #fff;
  margin-bottom: 10px;
  transition: ease-in-out 0.2s;
  cursor: pointer;
  padding: 10px 12px;
  border-radius: 5px;
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  border: 1px solid #f6c53e;
  background-color: #333333;
}
.item-in-list:hover {
  color: #fbe5ab;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
}
.bus-icon {
  width: 25px;
  height: 25px;
  margin-right: 10px;
}

.stop-edit {
  position: fixed;
  height: 100vh;
  width: 100vw;
  background: url("https://firebasestorage.googleapis.com/v0/b/kursova-a5f23.appspot.com/o/image.webp?alt=media&token=3b500288-0564-4ddb-a797-e69b79d42883");
  z-index: 95;
  top: 0;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  
}
.edit-island {
  margin-top: 20px;
  width: 600px;
  margin: 100px auto 0 auto;
  background-color: #474747;
  padding: 40px 30px;
  border-radius: 5px;
  box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
}
.close {
  width: 35px;
  position: relative;
  left: 570px;
  bottom: 100px;
  cursor: pointer;
  transition: ease-in-out 0.2s;
}
.close:hover {
  -webkit-filter: drop-shadow(5px 5px 5px #222);
  filter: drop-shadow(5px 5px 5px #222);
}
.top-edit {
  height: 70px;
}
.input-row {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
}
.label-input {
  font-size: 17px;
  font-family: "Rubik", sans-serif;
  font-weight: 500;
  color: #fff;
}
.inputs-edit {
  display: flex;
  flex-direction: column;
  justify-content: end;
  align-items: end;
  padding-right: 55px;
}
.e-input {
  width: 360px;
  height: 35px;
  border-radius: 7px;
  border: none;
  outline: none;
  padding-left: 20px;
  font-size: 17px;
  font-family: "Rubik", sans-serif;
  font-weight: 500;
  color: #474747;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
}
.row-center {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  margin-top: 50px;
  width: 475px;
  gap: 30px;
}
.save-changes {
  width: 150px;
  height: 35px;
  border-radius: 7px;
  border: none;
  outline: none;
  background-color: #f6c53e;
  font-size: 17px;
  font-family: "Rubik", sans-serif;
  font-weight: 500;
  color: #474747;
  cursor: pointer;
  transition: ease-in-out 0.1s;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
}

.save-changes {
  width: 150px;
  height: 50px;
  border-radius: 7px;
  border: none;
  outline: none;
  background-color: #f6c53e;
  font-size: 17px;
  font-family: "Rubik", sans-serif;
  font-weight: 500;
  color: #474747;
  cursor: pointer;
  transition: ease-in-out 0.1s;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
}
.save-changes:active {
  font-size: 15px;
  transition: ease-in-out 0.1s;
}
.remove {
  width: 150px;
  height: 50px;
  border-radius: 7px;
  border: none;
  outline: none;
  background-color: #f63e3e;
  font-size: 17px;
  font-family: "Rubik", sans-serif;
  font-weight: 500;
  color: #474747;
  cursor: pointer;
  transition: ease-in-out 0.1s;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
}
.remove:active {
  font-size: 15px;
  transition: ease-in-out 0.1s;
}
select {
  width: 380px;
  max-height: 160px;
  padding-left: 20px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  background-color: #fff;
  transition: border-color 0.3s;
  font-size: 17px;
  font-family: "Rubik", sans-serif;
  font-weight: 500;
  color: #474747;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
}

.list-stops {
  width: 360px;
  display: flex;
  flex-direction: column;
  justify-content: start;
  align-items: start;
  gap: 10px;
  max-height: 100px;
  overflow-y: scroll;
  margin-top: 10px;
  padding-left: 20px;
  padding-top: 10px;
  padding-bottom: 10px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
  outline: none;
  background-color: #fff;
  transition: border-color 0.3s;
  font-size: 17px;
  font-family: "Rubik", sans-serif;
  font-weight: 500;
  color: #474747;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
}
.checkbox-label {
  display: flex;
  flex-direction: row;
  justify-content: start;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.checkbox-input {
  width: 17px;
  height: 17px;
  border-radius: 5px;
  border: 1px solid #ccc;
  outline: none;
  background-color: #fff;
  transition: border-color 0.3s;
  cursor: pointer;
  box-shadow: rgba(0, 0, 0, 0.4) 0px 2px 4px,
    rgba(0, 0, 0, 0.3) 0px 7px 13px -3px, rgba(0, 0, 0, 0.2) 0px -3px 0px inset;
}
.cat-lng {
  width: 382px;
}
</style>
