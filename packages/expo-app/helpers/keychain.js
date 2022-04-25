import {
    ACCESS_CONTROL,
    ACCESSIBLE,
    AUTHENTICATION_TYPE,
    canImplyAuthentication,
    getAllInternetCredentials,
    getAllInternetCredentialsKeys,
    getInternetCredentials,
    getSupportedBiometryType,
    hasInternetCredentials,
    Options,
    resetInternetCredentials,
    Result,
    setInternetCredentials,
    UserCredentials,
} from 'react-native-keychain';

export async function loadKeychainValue(key) {
    try {
        const credentials = await getInternetCredentials(key);
        return credentials.password;
    } catch (err) {
        console.log(err);
    }
}

export async function saveKeychainValue(key, value, options) {
    try {
        await setInternetCredentials(key, key, value, options);
    } catch (err) {
        console.log(err);
    }
}

/* THIS FUNCTIONS ASSUMES IOS*/
export async function getAccessControlOptions() {
    let res = {};
    try {
        let canAuthenticate = await canImplyAuthentication({
            authenticationType: AUTHENTICATION_TYPE.DEVICE_PASSCODE_OR_BIOMETRICS,
        });

        let isSimulator = false;
        if (canAuthenticate && !isSimulator) {
            res = {
                accessControl: ACCESS_CONTROL.USER_PRESENCE,
                accessible: ACCESSIBLE.WHEN_UNLOCKED,
            };
        }
        // eslint-disable-next-line no-empty
    } catch (e) { }

    return res;
}
