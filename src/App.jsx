
import { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth } from "./firebase";
import Login from "./Login";
import "./App.css";

// =====================================
// PRODUCTOS
// =====================================

const productos = [
  { id: 1, nombre: "Pollo entero", precio: 75, categoria: "Pollos", emoji: "🍗" },
  { id: 2, nombre: "1/2 Pollo", precio: 40, categoria: "Pollos", emoji: "🍗" },
  { id: 3, nombre: "1/4 Pollo", precio: 23, categoria: "Pollos", emoji: "🍗" },
  { id: 4, nombre: "1/8 Pollo", precio: 14, categoria: "Pollos", emoji: "🍗" },
  { id: 5, nombre: "Mostrito", precio: 18, categoria: "Pollos", emoji: "🍱" },
  { id: 6, nombre: "Gaseosa personal", precio: 4, categoria: "Bebidas", emoji: "🥤" },
  { id: 7, nombre: "Gaseosa 1 litro", precio: 9, categoria: "Bebidas", emoji: "🥤" },
  { id: 8, nombre: "Gaseosa 1.5 litros", precio: 12, categoria: "Bebidas", emoji: "🥤" },
  { id: 9, nombre: "Gaseosa 2 litros", precio: 15, categoria: "Bebidas", emoji: "🥤" },
  { id: 10, nombre: "Chicha morada", precio: 6, categoria: "Bebidas", emoji: "🧃" },
  { id: 11, nombre: "Ensalada", precio: 5, categoria: "Extras", emoji: "🥗" },
  { id: 12, nombre: "Papas fritas", precio: 8, categoria: "Extras", emoji: "🍟" },
  { id: 13, nombre: "Gordita", precio: 4, categoria: "Bebidas", emoji: "🥤" },
];

const formato = (n) => `S/ ${Number(n).toFixed(2)}`;

// =====================================
// APLICACIÓN PRINCIPAL
// =====================================

function App() {
  // AUTENTICACIÓN
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(true);

  // ESTADOS DEL SISTEMA
  const [vista, setVista] = useState("mesero");
  const [categoria, setCategoria] = useState("Todos");
  const [carrito, setCarrito] = useState([]);
  const [tipoPedido, setTipoPedido] = useState("mesa");
  const [mesa, setMesa] = useState("1");
  const [pago, setPago] = useState("efectivo");
  const [montoRecibido, setMontoRecibido] = useState("");
  const [pedidos, setPedidos] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // VERIFICAR AUTENTICACIÓN
  useEffect(() => {
    const cancelar = onAuthStateChanged(auth, (user) => {
      setUsuario(user);
      setVerificando(false);
    });

    return () => cancelar();
  }, []);

  // CÁLCULOS
  const total = carrito.reduce(
    (suma, p) => suma + p.precio * p.cantidad,
    0
  );

  const vuelto = Math.max(
    0,
    Number(montoRecibido || 0) - total
  );

  const productosFiltrados = productos.filter(
    (p) => categoria === "Todos" || p.categoria === categoria
  );

  const pendientes = pedidos.filter(
    (p) => p.estado === "pendiente"
  );

  const preparacion = pedidos.filter(
    (p) => p.estado === "preparacion"
  );

  const entregados = pedidos.filter(
    (p) => p.estado === "entregado"
  );

  // AGREGAR PRODUCTOS
  function agregarProducto(producto) {
    setMensaje("");

    setCarrito((actual) => {
      const existe = actual.find(
        (p) => p.id === producto.id
      );

      if (existe) {
        return actual.map((p) =>
          p.id === producto.id
            ? { ...p, cantidad: p.cantidad + 1 }
            : p
        );
      }

      return [
        ...actual,
        { ...producto, cantidad: 1 }
      ];
    });
  }

  // CAMBIAR CANTIDAD
  function cambiarCantidad(id, cambio) {
    setCarrito((actual) =>
      actual
        .map((p) =>
          p.id === id
            ? { ...p, cantidad: p.cantidad + cambio }
            : p
        )
        .filter((p) => p.cantidad > 0)
    );
  }

  // REGISTRAR PEDIDOS
  function crearPedido() {
    if (carrito.length === 0) {
      setMensaje("Agrega al menos un producto.");
      return;
    }

    if (tipoPedido === "mesa" && !mesa.trim()) {
      setMensaje("Selecciona una mesa.");
      return;
    }

    if (
      pago === "efectivo" &&
      Number(montoRecibido) < total
    ) {
      setMensaje("El monto recibido no cubre el total.");
      return;
    }

    const nuevo = {
      id: Date.now(),
      numero: pedidos.length + 1,
      mesa: tipoPedido === "mesa" ? mesa : "Para llevar",
      tipo: tipoPedido,
      productos: carrito,
      total,
      pago,
      montoRecibido:
        pago === "efectivo"
          ? Number(montoRecibido)
          : total,
      estado: "pendiente",
      fecha: new Date().toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setPedidos((actuales) => [
      ...actuales,
      nuevo
    ]);

    setCarrito([]);
    setMontoRecibido("");
    setMensaje("¡Pedido registrado correctamente!");
  }

  // CAMBIAR ESTADOS
  function cambiarEstado(id, estado) {
    setPedidos((actuales) =>
      actuales.map((p) =>
        p.id === id
          ? { ...p, estado }
          : p
      )
    );
  }

  // RETIRAR PEDIDOS
  function retirarPedido(id) {
    setPedidos((actuales) =>
      actuales.filter((p) => p.id !== id)
    );
  }

  // CERRAR SESIÓN
  async function cerrarSesion() {
    try {
      await signOut(auth);
      setVista("mesero");
      setCarrito([]);
      setMensaje("");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
      setMensaje("No se pudo cerrar la sesión.");
    }
  }

  // PANTALLAS DE AUTENTICACIÓN
  if (verificando) {
    return (
      <div className="login-page">
        Verificando acceso...
      </div>
    );
  }

  if (!usuario) {
    return <Login onLogin={setUsuario} />;
  }

  // INTERFAZ PRINCIPAL
  return (
    <div className="app">

      <header className="topbar">

        <div className="brand">
          <div className="brand-icon">🍗</div>

          <div>
            <h1>POLLERÍA</h1>
            <span>Sistema de comandas</span>
          </div>
        </div>

        <nav className="navigation">

          <button
            className={
              vista === "mesero"
                ? "nav-btn active"
                : "nav-btn"
            }
            onClick={() => setVista("mesero")}
          >
            <span>🧾</span> Mesero
          </button>

          <button
            className={
              vista === "cocina"
                ? "nav-btn active"
                : "nav-btn"
            }
            onClick={() => setVista("cocina")}
          >
            <span>👨‍🍳</span> Cocina
          </button>

        </nav>

        <div className="connection">
          <span className="connection-dot"></span>
          Sistema local
        </div>

        <button
          className="nav-btn"
          onClick={cerrarSesion}
        >
          Cerrar sesión
        </button>

      </header>

      <main className={`main ${vista === "cocina" ? "main-kitchen" : ""}`}>

        {vista === "mesero" ? (

          // =================================
          // PANEL DEL MESERO
          // =================================

          <>

            <div className="page-heading">

              <div>
                <h2>Panel del mesero</h2>
                <p>
                  Registra pedidos y administra las comandas.
                </p>
              </div>

              <div className="date-label">
                📅 {new Date().toLocaleDateString("es-PE")}
              </div>

            </div>

            <div className="stats">

              <div className="stat-card">
                <span>Pedidos registrados</span>
                <strong>{pedidos.length}</strong>
                <small>En esta sesión</small>
              </div>

              <div className="stat-card yellow">
                <span>Pendientes</span>
                <strong>{pendientes.length}</strong>
                <small>Esperando cocina</small>
              </div>

              <div className="stat-card green">
                <span>En preparación</span>
                <strong>{preparacion.length}</strong>
                <small>En cocina</small>
              </div>

              <div className="stat-card blue">
                <span>Entregados</span>
                <strong>{entregados.length}</strong>
                <small>Listos para recoger</small>
              </div>

            </div>

            <div className="order-layout">

              {/* MENÚ DE PRODUCTOS */}

              <section className="panel menu-panel">

                <div className="panel-heading">
                  <div>
                    <h3>Menú de productos</h3>
                    <p>
                      Selecciona los productos del cliente.
                    </p>
                  </div>
                </div>

                <div className="categories">

                  {["Todos", "Pollos", "Bebidas", "Extras"].map((c) => (

                    <button
                      key={c}
                      onClick={() => setCategoria(c)}
                      className={
                        categoria === c
                          ? "category active"
                          : "category"
                      }
                    >
                      {c}
                    </button>

                  ))}

                </div>

                <div className="product-grid">

                  {productosFiltrados.map((p) => (

                    <button
                      className="product-card"
                      key={p.id}
                      onClick={() => agregarProducto(p)}
                    >

                      <span className="product-emoji">
                        {p.emoji}
                      </span>

                      <strong>{p.nombre}</strong>

                      <span className="product-price">
                        {formato(p.precio)}
                      </span>

                      <small>+ Agregar</small>

                    </button>

                  ))}

                </div>

              </section>

              {/* CARRITO Y PAGOS */}

              <section className="panel cart-panel">

                <div className="panel-heading">

                  <div>
                    <h3>Nuevo pedido</h3>
                    <p>Detalles de la comanda.</p>
                  </div>

                  <span className="cart-count">
                    {carrito.length} productos
                  </span>

                </div>

                <div className="order-type">

                  <button
                    className={
                      tipoPedido === "mesa"
                        ? "type-btn active"
                        : "type-btn"
                    }
                    onClick={() => setTipoPedido("mesa")}
                  >
                    🍽️ En mesa
                  </button>

                  <button
                    className={
                      tipoPedido === "llevar"
                        ? "type-btn active"
                        : "type-btn"
                    }
                    onClick={() => setTipoPedido("llevar")}
                  >
                    🛍️ Para llevar
                  </button>

                </div>

                {tipoPedido === "mesa" && (

                  <div className="field">

                    <label>Número de mesa</label>

                    <select
                      value={mesa}
                      onChange={(e) => setMesa(e.target.value)}
                    >

                      {Array.from(
                        { length: 20 },
                        (_, i) => (

                          <option
                            key={i + 1}
                            value={String(i + 1)}
                          >
                            Mesa {i + 1}
                          </option>

                        )
                      )}

                    </select>

                  </div>

                )}

                <div className="cart-items">

                  {carrito.length === 0 ? (

                    <div className="empty-cart">
                      <span>🛒</span>
                      <strong>Tu pedido está vacío</strong>
                      <p>
                        Selecciona productos del menú.
                      </p>
                    </div>

                  ) : (

                    carrito.map((p) => (

                      <div className="cart-item" key={p.id}>

                        <div className="cart-product">
                          <strong>{p.nombre}</strong>
                          <small>
                            {formato(p.precio)} c/u
                          </small>
                        </div>

                        <div className="quantity">

                          <button
                            onClick={() => cambiarCantidad(p.id, -1)}
                          >
                            −
                          </button>

                          <strong>{p.cantidad}</strong>

                          <button
                            onClick={() => cambiarCantidad(p.id, 1)}
                          >
                            +
                          </button>

                        </div>

                        <strong>
                          {formato(p.precio * p.cantidad)}
                        </strong>

                      </div>

                    ))

                  )}

                </div>

                <div className="payment-section">

                  <label>Método de pago</label>

                  <div className="payment-options">

                    <button
                      className={
                        pago === "efectivo"
                          ? "payment-btn active"
                          : "payment-btn"
                      }
                      onClick={() => setPago("efectivo")}
                    >
                      💵 Efectivo
                    </button>

                    <button
                      className={
                        pago === "yape"
                          ? "payment-btn active"
                          : "payment-btn"
                      }
                      onClick={() => setPago("yape")}
                    >
                      📱 Yape
                    </button>

                  </div>

                  {pago === "efectivo" && (

                    <div className="field">

                      <label>Monto recibido (S/)</label>

                      <input
                        type="number"
                        min="0"
                        value={montoRecibido}
                        onChange={(e) =>
                          setMontoRecibido(e.target.value)
                        }
                        placeholder="Ej. 100"
                      />

                      <div className="change">
                        <span>Vuelto</span>
                        <strong>{formato(vuelto)}</strong>
                      </div>

                    </div>

                  )}

                </div>

                <div className="total-row">

                  <span>Total a pagar</span>

                  <strong>{formato(total)}</strong>

                </div>

                {mensaje && (
                  <div className="message">
                    {mensaje}
                  </div>
                )}

                <button
                  className="submit-order"
                  onClick={crearPedido}
                >
                  ✓ Registrar pedido
                </button>

              </section>

            </div>

            {entregados.length > 0 && (

              <section className="panel ready-panel">

                <h3>🔵 Pedidos listos para recoger</h3>

                {entregados.map((p) => (

                  <div className="ready-item" key={p.id}>

                    <strong>
                      Pedido #{p.numero} · {p.mesa}
                    </strong>

                    <button
                      onClick={() => retirarPedido(p.id)}
                    >
                      Entregar al cliente
                    </button>

                  </div>

                ))}

              </section>

            )}

          </>

        ) : (

          // =================================
          // PANEL DE COCINA
          // =================================

          <>

            <div className="page-heading">

              <div>
                <h2>Panel de cocina</h2>
                <p>
                  Control de comandas y preparación de pedidos.
                </p>
              </div>

              <div className="kitchen-badge">
                👨‍🍳 Cocina activa
              </div>

            </div>

            {/* SE ELIMINARON LAS TRES TARJETAS DE ESTADÍSTICAS */}

            <div className="kitchen-columns">

              <KitchenColumn
                titulo="Pendientes"
                color="yellow"
                pedidos={pendientes}
                accion="Comenzar preparación"
                siguiente="preparacion"
                cambiarEstado={cambiarEstado}
              />

              <KitchenColumn
                titulo="En preparación"
                color="green"
                pedidos={preparacion}
                accion="Marcar entregado"
                siguiente="entregado"
                cambiarEstado={cambiarEstado}
              />

              <KitchenColumn
                titulo="Entregados"
                color="blue"
                pedidos={entregados}
                accion="Esperando al mesero"
                cambiarEstado={cambiarEstado}
              />

            </div>

          </>

        )}

      </main>

    </div>
  );
}

// =====================================
// COMPONENTE DE COCINA
// =====================================

function KitchenColumn({
  titulo,
  color,
  pedidos,
  accion,
  siguiente,
  cambiarEstado
}) {

  return (

    <section className={`kitchen-column ${color}`}>

      <div className="column-heading">

        <h3>{titulo}</h3>

        <span>{pedidos.length}</span>

      </div>

      {pedidos.length === 0 ? (

        <div className="empty-column">
          No hay pedidos
        </div>

      ) : (

        pedidos.map((p) => (

          <article className="ticket" key={p.id}>

            <div className="ticket-top">

              <strong>
                Pedido #{p.numero}
              </strong>

              <span>{p.fecha}</span>

            </div>

            <div className="ticket-table">

              {p.tipo === "mesa"
                ? `Mesa ${p.mesa}`
                : "Para llevar"}

            </div>

            <div className="ticket-products">

              {p.productos.map((producto) => (

                <div key={producto.id}>

                  <strong>
                    {producto.cantidad}x
                  </strong>

                  {" "}

                  {producto.nombre}

                </div>

              ))}

            </div>

            <div className="ticket-bottom">

              <strong>{formato(p.total)}</strong>

              {siguiente && (

                <button
                  onClick={() =>
                    cambiarEstado(p.id, siguiente)
                  }
                >
                  {accion}
                </button>

              )}

            </div>

          </article>

        ))

      )}

    </section>

  );

}

export default App;
