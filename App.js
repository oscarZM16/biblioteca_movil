import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

const Stack = createNativeStackNavigator();

import LibrosList from './screens/Libros/LibrosList';
import CreateLibro from "./screens/Libros/CreateLibro";
import LibroDetail from "./screens/Libros/LibroDetail";
import UsuariosList from './screens/Usuarios/UsuariosList';
import UsuarioDetail from './screens/Usuarios/UsuarioDetail';
import CreateUsuario from './screens/Usuarios/CreateUsuario';
import Home from './screens/Home';
import CreatePrestamo from './screens/Prestamos/CreatePrestamo';
import PrestamoList from './screens/Prestamos/PrestamoList';


function MyStack() {
  return(
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home} options={{title: 'Inicio'}} />
      <Stack.Screen name="LibrosList" component={LibrosList} options={{title: 'Lista de Libros'}} />
      <Stack.Screen name='CreateLibro' component={CreateLibro} options={{title: 'Crea un Libro'}} />
      <Stack.Screen name='LibroDetail' component={LibroDetail} options={{title: 'Detalles de Usuario'}} />
      <Stack.Screen name="UsuariosList" component={UsuariosList} options={{title: 'Lista de Usuarios'}} />
      <Stack.Screen name="CreateUsuario" component={CreateUsuario} options={{title: 'Crear Usuario'}} />
      <Stack.Screen name="UsuarioDetail" component={UsuarioDetail} options={{title: 'Detalles del Usuario'}} />
      <Stack.Screen name="CreatePrestamo" component={CreatePrestamo} options={{title: 'Crear Prestamo'}} />
      <Stack.Screen name="PrestamoList" component={PrestamoList} options={{title: 'Lista de Prestamos'}} />
    </Stack.Navigator>
  )
}

export default function App() {
  return (
    <NavigationContainer>
      <MyStack/>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
