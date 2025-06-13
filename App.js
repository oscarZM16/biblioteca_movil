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
import PrestamoDetail from './screens/Prestamos/PrestamoDetail';
import MultasList from './screens/multas/MultasList';
import ReportesMenuScreen from './screens/reportes/ReportesMenuScreen'
import ReportesScreen from './screens/reportes/ReportesScreen';
import ReporteLibrosGuardadosScreen from './screens/reportes/ReporteLibrosGuardadosScreen';
import ReporteUsuariosRegistradosScreen from './screens/reportes/ReporteUsuariosRegistradosScreen'
import ReporteMultasTotalesScreen from './screens/reportes/ReporteMultasTotalesScreen'


function MyStack() {
  return(
    <Stack.Navigator>
      <Stack.Screen name="Home" component={Home} options={{title: 'Inicio'}} />
      <Stack.Screen name="LibrosList" component={LibrosList} options={{title: 'Lista de Libros'}} />
      <Stack.Screen name='CreateLibro' component={CreateLibro} options={{title: 'Crea un Libro'}} />
      <Stack.Screen name='LibroDetail' component={LibroDetail} options={{title: 'Detalles del Libro'}} />
      <Stack.Screen name="UsuariosList" component={UsuariosList} options={{title: 'Lista de Usuarios'}} />
      <Stack.Screen name="CreateUsuario" component={CreateUsuario} options={{title: 'Crear Usuario'}} />
      <Stack.Screen name="UsuarioDetail" component={UsuarioDetail} options={{title: 'Detalles del Usuario'}} />
      <Stack.Screen name="CreatePrestamo" component={CreatePrestamo} options={{title: 'Crear Prestamo'}} />
      <Stack.Screen name="PrestamoList" component={PrestamoList} options={{title: 'Lista de Prestamos'}} />
      <Stack.Screen name="PrestamoDetail" component={PrestamoDetail} options={{title: 'Detalles del prestamo'}} />
      <Stack.Screen name="MultasList" component={MultasList} options={{ title: 'Multas' }} />
      <Stack.Screen name="ReportesMenuScreen" component={ReportesMenuScreen} options={{ title: 'Menu Reportes' }} />
      <Stack.Screen name="ReporteLibrosGuardadosScreen" component={ReporteLibrosGuardadosScreen} options={{ title: 'Reporte de Libros' }} />
      <Stack.Screen name="ReporteUsuariosRegistradosScreen" component={ReporteUsuariosRegistradosScreen} options={{ title: 'Reporte de Usuarios' }} />
      <Stack.Screen name="ReporteMultasTotalesScreen" component={ReporteMultasTotalesScreen} options={{ title: 'Reporte de Multas' }} />
      <Stack.Screen name="ReportesScreen" component={ReportesScreen} options={{ title: 'Reporte de Estadisticas' }} />
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
