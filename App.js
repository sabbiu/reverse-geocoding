import React from 'react';
import { Platform, Text, View, StyleSheet, Button} from 'react-native';
import { Constants, Location, Permissions } from 'expo';

const APP_ID = 'UKhHL43f0Jn8w6VlwEBM';
const APP_CODE = 'tTiDzSfMjd7soLpAWpn_Hw'

const GEOCODER_API =`https://reverse.geocoder.api.here.com/6.2/reversegeocode.json?app_id=${APP_ID}&app_code=${APP_CODE}`

export default class App extends React.Component {
  state = {
    location: null,
    errorMessage: null,
  };

  componentWillMount() {
    if (Platform.OS === 'android' && !Constants.isDevice) {
      this.setState({
        errorMessage: 'Oops, this will not work on Sketch in an Android emulator. Try it on your device!',
      });
    } else {
      this._getLocationAsync();
    }
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    const provider = await Location.getProviderStatusAsync();
    if (!provider.gpsAvailable && !provider.locationServicesEnabled) {
      this.setState({ errorMessage: 'GPS not enabled' });
    } else {
      let location = await Location.getCurrentPositionAsync({});
      try {
        let APIResponse = await fetch(`${GEOCODER_API}&prox=${location.coords.latitude},${location.coords.longitude},250&mode=retrieveAddresses&maxresults=1`)
        APIResponse = await APIResponse.json();
        const address = APIResponse.Response.View[0].Result[0].Location.Address;
        const locationText =  !!address ? `${address.Label} : ${address.State}, ${address.City}, ${address.Country}` : 'Not Found';
        this.setState({ location: locationText, errorMessage: ''});
      } catch (error) {
        this.setState({ errorMessage: 'API Error' });
      }
    }
  };

  render() {
    let text = 'Waiting..';
    if (this.state.errorMessage) {
      text = this.state.errorMessage;
    } else if (this.state.location) {
      text = this.state.location;
    }

    return (
      <View style={styles.container}>
        <Text style={styles.paragraph}>{text}</Text>
        <Button onPress={this._getLocationAsync} title="Check My Address" />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Constants.statusBarHeight,
    backgroundColor: '#ecf0f1',
  },
  paragraph: {
    margin: 24,
    fontSize: 18,
    textAlign: 'center',
  },
});
