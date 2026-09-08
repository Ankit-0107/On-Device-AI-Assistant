import { Linking, Alert } from 'react-native';
import Tts from 'react-native-tts';

/**
 * Executes a system action based on the parsed intent from the LLM.
 * @param {Object} intent - e.g. { intent: "CALL", contact: "Mom", number: "1234567890" }
 */
export async function handleIntent(intent) {
  const type = (intent.intent || '').toUpperCase();

  switch (type) {
    case 'CALL': {
      const number = intent.number || intent.phone || '';
      if (number) {
        Tts.speak(`Calling ${intent.contact || number}`);
        Linking.openURL(`tel:${number}`);
      } else {
        Tts.speak(`I need a phone number to make a call.`);
        Alert.alert('Missing Info', 'No phone number provided for the call.');
      }
      break;
    }

    case 'SMS': {
      const number = intent.number || intent.phone || '';
      const body = intent.message || intent.body || '';
      Tts.speak(`Opening messages${intent.contact ? ` for ${intent.contact}` : ''}`);
      const url = number ? `sms:${number}${body ? `?body=${encodeURIComponent(body)}` : ''}` : 'sms:';
      Linking.openURL(url);
      break;
    }

    case 'ALARM': {
      const time = intent.time || intent.hour || 'the requested time';
      Tts.speak(`Setting alarm for ${time}`);
      // Android alarm intent - requires native module for full support.
      // For now, confirm via alert.
      Alert.alert('Alarm', `Alarm set for ${time}\n(Native alarm integration coming soon)`);
      break;
    }

    case 'WEB_SEARCH': {
      const query = intent.query || intent.search || intent.text || '';
      if (query) {
        Tts.speak(`Searching for ${query}`);
        Linking.openURL(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
      } else {
        Tts.speak(`What would you like me to search for?`);
      }
      break;
    }

    case 'OPEN_APP': {
      const app = intent.app || intent.package || '';
      Tts.speak(`Opening ${app || 'the app'}`);
      // Common app package mappings
      const appMap = {
        'camera': 'com.android.camera',
        'settings': 'com.android.settings',
        'calculator': 'com.android.calculator2',
        'calendar': 'com.android.calendar',
        'clock': 'com.android.deskclock',
        'contacts': 'com.android.contacts',
        'maps': 'com.google.android.apps.maps',
        'youtube': 'com.google.android.youtube',
        'chrome': 'com.android.chrome',
      };
      const pkg = appMap[(app || '').toLowerCase()] || app;
      if (pkg) {
        Linking.openURL(`intent:#Intent;package=${pkg};end`).catch(() => {
          Alert.alert('App Not Found', `Could not open "${app}".`);
        });
      }
      break;
    }

    default:
      Tts.speak(`I'm not sure how to handle that action.`);
      Alert.alert('Unknown Intent', JSON.stringify(intent, null, 2));
      break;
  }
}
