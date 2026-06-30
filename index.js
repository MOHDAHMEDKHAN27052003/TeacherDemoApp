/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);

export { default as TeachingDataList } from './src/components/DataList';
export { default as useTeachingData } from './src/hooks/useTeachingData';
export * from './src/types/types';