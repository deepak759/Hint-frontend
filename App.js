import { StatusBar } from "expo-status-bar";
import { Button, StyleSheet, View, Text, Image } from "react-native";
import { useEffect, useState } from "react";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import {
  AccessToken,
  GraphRequest,
  GraphRequestManager,
  LoginButton,
  Settings,
} from "react-native-fbsdk-next";

export default function App() {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const requestTracking = async () => {
      const { status } = await requestTrackingPermissionsAsync();

      Settings.initializeSDK();

      if (status === "granted") {
        await Settings.setAdvertiserTrackingEnabled(true);
      }
    };

    requestTracking();
  }, []);

  const getData = () => {
    const infoRequest = new GraphRequest(
      "/me",
      {
        parameters: {
          fields: {
            string: "id,name,email,picture.type(large),birthday,hometown,location,gender,age_range,link,friends,likes",
          },
        },
      },
      (error, result) => {
        console.log(error || result);
        if (!error) {
          setUserData(result);
        }
      }
    );
    new GraphRequestManager().addRequest(infoRequest).start();
  };

  return (
    <View style={styles.container}>
      <LoginButton
        onLogoutFinished={() => {
          console.log("Logged out");
          setUserData(null);
        }}
        onLoginFinished={(error, data) => {
          console.log(error || data);
          AccessToken.getCurrentAccessToken().then((data) =>
            console.log(data)
          );
        }}
      />
      <Button title="Get Data" onPress={getData} />
      {userData && (
        <View style={styles.userInfo}>
          <Text>Name: {userData.name}</Text>
          <Text>Email: {userData.email}</Text>
          <Text>Birthday: {userData.birthday}</Text>
          <Text>Hometown: {userData.hometown?.name}</Text>
          <Text>Location: {userData.location?.name}</Text>
          <Text>Gender: {userData.gender}</Text>
          <Text>Age Range: {userData.age_range?.min} - {userData.age_range?.max}</Text>
          <Text>Profile Link: {userData.link}</Text>
          <Image source={{ uri: userData.picture.data.url }} style={styles.image} />
        </View>
      )}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  userInfo: {
    alignItems: "center",
    marginTop: 20,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginTop: 10,
  },
});
