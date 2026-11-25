import { useState } from 'react'
import { ThemeSelector } from '../../../theme/ThemeProvider'
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dropdown,
  EmptyState,
  Input,
  LoadingState,
  Modal,
  Select,
  Skeleton,
  Tabs,
  Textarea,
  Toast,
} from './index'
import './styleguide.css'

export default function Styleguide() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [toastOpen, setToastOpen] = useState(false)

  return (
    <main className="styleguide">
      <header className="styleguide__header">
        <div>
          <p>AEGIS · Uso interno</p>
          <h1>Sistema de diseño</h1>
          <p>Componentes compartidos y estados de la interfaz web.</p>
        </div>
        <ThemeSelector />
      </header>
      <div className="styleguide__grid">
        <Card className="styleguide__card">
          <h2>Acciones</h2>
          <div className="styleguide__row">
            <Button>Primario</Button>
            <Button variant="secondary">Secundario</Button>
            <Button variant="quiet">Discreto</Button>
            <Button variant="danger">Eliminar</Button>
            <Button disabled>Deshabilitado</Button>
          </div>
          <div className="styleguide__row">
            <Button onClick={() => setDialogOpen(true)}>Abrir diálogo</Button>
            <Button variant="secondary" onClick={() => setToastOpen(true)}>
              Mostrar aviso
            </Button>
            <Dropdown
              label="Opciones"
              items={[
                { label: 'Mostrar aviso', onSelect: () => setToastOpen(true) },
              ]}
            />
          </div>
        </Card>
        <Card className="styleguide__card">
          <h2>Campos</h2>
          <Input
            label="Nombre"
            placeholder="Escribe tu nombre"
            hint="Como aparece en tu perfil."
          />
          <Input
            label="Correo"
            defaultValue="correo"
            error="Introduce un correo válido."
          />
          <Select label="Categoría" defaultValue="tecnologia">
            <option value="tecnologia">Tecnología</option>
            <option value="otros">Otros</option>
          </Select>
          <Textarea label="Descripción" placeholder="Cuéntanos más" />
        </Card>
        <Card className="styleguide__card">
          <h2>Contenido y estados</h2>
          <div className="styleguide__row">
            <Avatar name="Ana Pérez" />
            <Badge>Normal</Badge>
            <Badge tone="success">Verificado</Badge>
            <Badge tone="warning">Pendiente</Badge>
            <Badge tone="danger">Error</Badge>
            <Badge tone="info">Información</Badge>
          </div>
          <Tabs
            label="Ejemplo de secciones"
            tabs={[
              {
                id: 'primera',
                label: 'Primera',
                content: 'Contenido de la primera sección.',
              },
              {
                id: 'segunda',
                label: 'Segunda',
                content: 'Contenido de la segunda sección.',
              },
            ]}
          />
          <EmptyState
            title="Sin resultados"
            message="Prueba con otros filtros."
            compact
          />
          <LoadingState message="Cargando contenido..." compact />
          <Skeleton width="100%" height="1rem" />
        </Card>
      </div>
      <Modal
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title="Ejemplo de diálogo"
      >
        <p>Este diálogo utiliza el componente compartido.</p>
        <Button onClick={() => setDialogOpen(false)}>Entendido</Button>
      </Modal>
      <Toast
        open={toastOpen}
        message="Aviso de ejemplo."
        onClose={() => setToastOpen(false)}
      />
    </main>
  )
}
