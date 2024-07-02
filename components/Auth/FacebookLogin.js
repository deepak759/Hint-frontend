import { StatusBar } from "expo-status-bar";
import { StyleSheet, View, Button } from "react-native";
import { useEffect, useState } from "react";
import { requestTrackingPermissionsAsync } from "expo-tracking-transparency";
import {
  AccessToken,
  GraphRequest,
  GraphRequestManager,
  LoginButton,
  Settings,
} from "react-native-fbsdk-next";

export default function FacebookLogin({ setIsUsingOuth, isLogin, onSubmit }) {
  const [userData, setUserData] = useState(null);
  const [loggedIn, setLoggedIn] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const requestTracking = async () => {
      const { status } = await requestTrackingPermissionsAsync();
      Settings.initializeSDK();
      if (status === "granted") {
        await Settings.setAdvertiserTrackingEnabled(true);
      }
    };

    // Check every 5 seconds

    requestTracking();

    // return () => clearInterval(intervalId); // Clear interval on component unmount
  }, []);

  const checkLoginStatus = async () => {
    const data = await AccessToken.getCurrentAccessToken();
    if (data) {
      setLoggedIn(true);
      getData(data.accessToken.toString());
    }
  };
  let interval;
  useEffect(() => {
    if (checking) {
      interval = setInterval(checkLoginStatus, 5000);
    }
  }, [checking]);

  const getData = (accessToken) => {
    const infoRequest = new GraphRequest(
      "/me",
      {
        parameters: {
          fields: {
            string:
              "id,name,email,picture.type(large),birthday,hometown,location,gender,age_range,link,friends,likes",
          },
        },
        accessToken: accessToken,
      },
      (error, result) => {
        console.log(error || result);
        if (!error) {
          setUserData(result);
          if (result.name && result.email) {
            // onSubmit({ name: result.name, email: result.email });
            console.log(result.name, result.email);
            setIsUsingOuth(true);
            setChecking(false); // Clear interval once data is fetched
            clearInterval(interval);
            if (isLogin) {
              onSubmit({ email: result.email, password: "bdsdgdjdhsdsgde",  userName: result.name,confirmPassword:"bdsdgdjdhsdsgde" });
            } else {
              onSubmit({
                userName: result.name,
                email: result.email,
                password: "bdsdgdjdhsdsgde",
                confirmPassword:"bdsdgdjdhsdsgde"
              });
            }
          }
        }
      }
    );
    new GraphRequestManager().addRequest(infoRequest).start();
  };

  return (
    <LoginButton
      onLogoutFinished={() => {
        console.log("Logged out");
        setUserData(null);
        setLoggedIn(false);
      }}
      onLoginFinished={(error, result) => {
        console.log("consoling from button", error || result);
        if (!error && result) {
          AccessToken.getCurrentAccessToken().then((data) => {
            if (data) {
              setLoggedIn(true);
            }
          });
        }
      }}
    />
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
