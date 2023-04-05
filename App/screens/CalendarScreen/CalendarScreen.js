import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Alert,
} from "react-native";
import { React, useEffect, useLayoutEffect, useState } from "react";
import { Calendar } from "react-native-calendars";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Overlay } from "@rneui/themed";
import DateTimePicker from "@react-native-community/datetimepicker";
import OneEvent from "./OneEvent";
import { COLORS } from "../../constants/COLORS";

export default function CalendarScreen(props) {
  const [selectedDate, setSelectedDate] = useState(
    getDateInGoodFormat(new Date())
  );
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState("date");
  const [show, setShow] = useState(false);
  const [events, setEvents] = useState();
  const [eventAddOverlay, setEventAddOverlay] = useState(false);

  const [eventName, setEventName] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  const [isFirstTime, setIsFirstTime] = useState("1");
  const [eventDate, setEventDate] = useState(new Date());
  const [firstEventTime, setFirstEventTime] = useState(new Date());
  const [secondEventTime, setSecondEventTime] = useState(new Date());
  const [eventsOnDate, setEventsOnDate] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [editedData, setEditedData] = useState(null);

  useLayoutEffect(() => {
    setSelectedDate(getDateInGoodFormat(new Date()));
    props.navigation.setOptions({ title: "Calendar" });
    const retrieveMarkedDates = async () => {
      try {
        const temp = await AsyncStorage.getItem("eventDates");
        if (temp !== null) {
          setEvents(JSON.parse(temp));
        }
      } catch (error) {
        console.error("Error at useEffect in CalendarScreen: ", error);
      }
    };

    retrieveMarkedDates();
  }, []);

  useEffect(() => {}, [eventsOnDate]);

  useEffect(() => {
    const retrieveEventsOnDay = async () => {
      try {
        let temp;
        if (selectedDate !== undefined) {
          temp = await AsyncStorage.getItem(selectedDate);
        }
        if (temp !== null) {
          setEventsOnDate(JSON.parse(temp));
        } else {
          setEventsOnDate(null);
        }
      } catch (error) {
        console.log("Error in loading the events for a day: ", error);
      }
    };

    retrieveEventsOnDay();
  }, [selectedDate]);

  const onChange = (event, tempDate) => {
    if (event.type !== "dismissed") {
      setShow(false);

      if (isFirstTime == "1") {
        const date = new Date(tempDate);
        setEventDate(date);
      }
      if (isFirstTime == "2") {
        const date = new Date(tempDate);
        setFirstEventTime(date);
      }
      if (isFirstTime == "3") {
        const date = new Date(tempDate);
        setSecondEventTime(date);
      }
    } else {
      setShow(false);
    }
  };

  const showMode = (currentMode) => {
    setMode(currentMode);
    setShow(true);
  };

  function GetWeekday(timestamp) {
    const date = new Date(timestamp);
    if (date.getDay() == 0) return "Sunday";
    if (date.getDay() == 1) return "Monday";
    if (date.getDay() == 2) return "Tuesday";
    if (date.getDay() == 3) return "Wednesday";
    if (date.getDay() == 4) return "Thursday";
    if (date.getDay() == 5) return "Friday";
    if (date.getDay() == 6) return "Saturday";
  }

  function getDateInGoodFormat(date) {
    let month = (date.getMonth() + 1).toString();
    if (month.length == 1) month = "0" + month;

    let day = date.getDate().toString();
    if (day.length == 1) day = "0" + day;

    return date.getFullYear() + "-" + month + "-" + day;
  }

  const handleAddEvent = async () => {
    setShow(false);
    setEventAddOverlay(!eventAddOverlay);
    let month = (eventDate.getMonth() + 1).toString();
    if (month.length == 1) month = "0" + month;
    let dateTemp = eventDate.getDate().toString();
    if (dateTemp.length == 1) dateTemp = "0" + dateTemp;
    const asyncKey = eventDate.getFullYear() + "-" + month + "-" + dateTemp;

    const dataToSubmit = {
      id: Math.random(),
      date: eventDate,
      from: firstEventTime,
      to: secondEventTime,
      name: eventName,
      description: eventDescription,
    };

    try {
      const temp = await AsyncStorage.getItem(asyncKey);
      let tempArray = [];
      if (temp !== null) {
        tempArray = JSON.parse(temp);
      }
      tempArray.push(dataToSubmit);

      await AsyncStorage.setItem(asyncKey, JSON.stringify(tempArray));

      const tempEvents = await AsyncStorage.getItem("eventDates");
      let asyncEvents;
      if (tempEvents !== null) {
        asyncEvents = JSON.parse(tempEvents);
        asyncEvents = {
          ...asyncEvents,
          ...([asyncKey] in asyncEvents
            ? {}
            : { [asyncKey]: { marked: true, dotColor: "red" } }),
        };
      } else {
        asyncEvents = { [asyncKey]: { marked: true, dotColor: "red" } };
      }

      setEvents(asyncEvents);
      setEventsOnDate(tempArray);
      setSelectedDate(asyncKey);

      await AsyncStorage.setItem("eventDates", JSON.stringify(asyncEvents));
    } catch (error) {
      console.error("Error at uploading the event in CalendarScreen: ", error);
    }

    makeEverythingOriginal();
  };

  const handleOnDelete = async () => {
    try {
      const temp = JSON.parse(await AsyncStorage.getItem(selectedDate));

      if (temp.length == 0) {
        delete events[selectedDate];
        await AsyncStorage.setItem("eventDates", JSON.stringify(events));
        setEvents(events);
        setEventsOnDate(temp);
      } else {
        setEventsOnDate(temp);
      }
    } catch (error) {
      console.error("Error at updating after deleting an event: ", error);
    }
  };

  const handleOnEdit = async (dataPassed) => {
    setEditedData(dataPassed);
    setEventName(dataPassed.data.name);
    setEventDescription(dataPassed.data.description);
    setFirstEventTime(new Date(dataPassed.data.from));
    setSecondEventTime(new Date(dataPassed.data.to));
    setEventAddOverlay(!eventAddOverlay);
  };

  const saveEditChanges = async () => {
    const newData = {
      id: editedData.data.id,
      date: eventDate,
      from: firstEventTime,
      to: secondEventTime,
      name: eventName,
      description: eventDescription,
    };

    const updatedEventsOnDate = eventsOnDate.map((item) => {
      if (item.id === editedData.data.id) {
        return newData;
      } else {
        return item;
      }
    });

    setEventsOnDate(updatedEventsOnDate);
    setIsEdit(false);

    try {
      await AsyncStorage.setItem(
        selectedDate,
        JSON.stringify(updatedEventsOnDate)
      );
    } catch (error) {
      console.error("Error at updating the edit: ", error);
    }
    setEventAddOverlay(!eventAddOverlay);
    setEditedData(dataPassed);
    setEventName(dataPassed.data.name);
    setEventDescription(dataPassed.data.description);
    setFirstEventTime(new Date(dataPassed.data.from));
    setSecondEventTime(new Date(dataPassed.data.to));
    makeEverythingOriginal();
  };

  const makeEverythingOriginal = () => {
    setEventName("");
    setEventDescription("");
    setFirstEventTime(new Date());
    setSecondEventTime(new Date());
  };

  return (
    <View style={{ flex: 1 }}>
      <View>
        <Calendar
          onDayPress={(day) => {
            console.log(day.dateString);
            setSelectedDate(day.dateString);
          }}
          onDayLongPress={(day) => {
            const date = new Date(day.timestamp);

            setEventDate(date);
            if (!isEdit) makeEverythingOriginal();
            setEventAddOverlay(!eventAddOverlay);
          }}
          markedDates={{ ...events, [selectedDate]: { selected: true } }}
        />
      </View>

      <View
        style={{
          paddingTop: 10,
          flex: 1,
        }}
      >
        <FlatList
          data={eventsOnDate}
          renderItem={({ item }) => (
            <OneEvent
              onDelete={handleOnDelete}
              onEdit={(dataPassed) => {
                setIsEdit(true);
                handleOnEdit(dataPassed);
              }}
              data={item}
              date={selectedDate}
            />
          )}
        />
      </View>

      <View style={{}}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            console.log(selectedDate);
            //console.log(getDateInGoodFormat(selectedDate));
            const date = new Date(selectedDate);

            setEventDate(date);
            if (!isEdit) makeEverythingOriginal();
            setEventAddOverlay(!eventAddOverlay);
          }}
        >
          <Text style={{ fontSize: 30 }}> + </Text>
        </TouchableOpacity>
      </View>

      <View>
        <Overlay
          isVisible={eventAddOverlay}
          onBackdropPress={() => {
            setEventAddOverlay(!eventAddOverlay);
            setEventName("");
            setEventDescription("");
            setIsEdit(false);
          }}
        >
          <TouchableOpacity
            onPress={() => {
              setIsFirstTime("1");
              showMode("date");
            }}
            style={{
              borderWidth: 1,
              borderRadius: 5,
              backgroundColor: "white",
              elevation: 4,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text style={{ paddingHorizontal: 5, paddingVertical: 5 }}>
              Date: {eventDate.getFullYear()}/{eventDate.getMonth() + 1}/
              {eventDate.getDate()} ({GetWeekday(eventDate)})
            </Text>
          </TouchableOpacity>
          <View style={{ paddingTop: 10 }} />
          <TouchableOpacity
            onPress={() => {
              setIsFirstTime("2");
              showMode("time");
            }}
            style={{
              borderWidth: 1,
              borderRadius: 5,
              backgroundColor: "white",
              elevation: 4,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text style={{ paddingHorizontal: 5, paddingVertical: 5 }}>
              From: {firstEventTime.getHours()}:{firstEventTime.getMinutes()}
            </Text>
          </TouchableOpacity>
          <View style={{ paddingTop: 10 }} />
          <TouchableOpacity
            onPress={() => {
              setIsFirstTime("3");
              showMode("time");
            }}
            style={{
              borderWidth: 1,
              borderRadius: 5,
              backgroundColor: "white",
              elevation: 4,
              width: "100%",
              alignItems: "center",
            }}
          >
            <Text style={{ paddingHorizontal: 5, paddingVertical: 5 }}>
              To: {secondEventTime.getHours()}:{secondEventTime.getMinutes()}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />
          <TextInput
            style={{
              width: Dimensions.get("window").width * 0.9,
              height: 40,
              borderWidth: 1,
              paddingLeft: 10,
              fontWeight: "bold",
              borderRadius: 15,
              backgroundColor: "white",
            }}
            placeholder="Event name"
            placeholderTextColor={"gray"}
            value={eventName}
            onChangeText={(text) => setEventName(text)}
            maxLength={64}
          />

          <View style={{ height: 20 }} />

          <TextInput
            style={{
              width: Dimensions.get("window").width * 0.9,
              height: 40,
              borderWidth: 1,
              paddingLeft: 10,
              borderRadius: 15,
              backgroundColor: "white",
            }}
            placeholderTextColor={"gray"}
            placeholder="Event decription"
            value={eventDescription}
            onChangeText={(text) => setEventDescription(text)}
            maxLength={256}
          />

          {show && (
            <DateTimePicker
              testID="dateTimePicker"
              value={date}
              mode={mode}
              is24Hour={true}
              onChange={onChange}
            />
          )}
          <View style={{ paddingTop: 15 }} />
          <View
            style={{
              flexDirection: "row",
              paddingVertical: 15,
            }}
          >
            <TouchableOpacity
              onPress={() => {
                setEventAddOverlay(!eventAddOverlay);
                setEventName("");
                setEventDescription("");
                setIsEdit(false);
              }}
              style={{
                backgroundColor: COLORS.primary,
                alignItems: "center",
                borderWidth: 1,
                borderRadius: 5,
                elevation: 4,
                justifyContent: "center",
                position: "absolute",
                left: 5,
              }}
            >
              <Text
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: 16,
                  paddingHorizontal: 5,
                  paddingVertical: 5,
                }}
              >
                Cancel
              </Text>
            </TouchableOpacity>

            {!isEdit && (
              <TouchableOpacity
                onPress={() => {
                  if (eventName === "") {
                    Alert.alert(
                      "Error",
                      "Event name can not be empty",
                      [{ text: "Ok", onPress: () => {} }],
                      { cancelable: true }
                    );
                  } else {
                    handleAddEvent();
                  }
                }}
                style={{
                  backgroundColor: COLORS.primary,
                  alignItems: "center",
                  borderWidth: 1,
                  borderRadius: 5,
                  elevation: 4,
                  justifyContent: "center",
                  position: "absolute",
                  right: 5,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 16,
                    paddingHorizontal: 5,
                    paddingVertical: 5,
                  }}
                >
                  Add event
                </Text>
              </TouchableOpacity>
            )}

            {isEdit && (
              <TouchableOpacity
                onPress={() => {
                  if (eventName === "") {
                    Alert.alert(
                      "Error",
                      "Event name can not be empty",
                      [{ text: "Ok", onPress: () => {} }],
                      { cancelable: true }
                    );
                  } else {
                    saveEditChanges();
                  }
                }}
                style={{
                  backgroundColor: COLORS.primary,
                  alignItems: "center",
                  borderWidth: 1,
                  borderRadius: 5,
                  elevation: 4,
                  justifyContent: "center",
                  position: "absolute",
                  right: 5,
                }}
              >
                <Text
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    fontSize: 16,
                    paddingHorizontal: 5,
                    paddingVertical: 5,
                  }}
                >
                  Save changes
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Overlay>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 10,
    right: 10,
    elevation: 5,
  },
});
