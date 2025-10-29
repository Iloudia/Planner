import { useNavigate } from 'react-router-dom'

type BackButtonProps = {
  label?: string
}

const BackButton = ({ label = 'Retour' }: BackButtonProps) => {
  const navigate = useNavigate()

  return (
    <button type="button" className="back-button" onClick={() => navigate(-1)}>
      {label}
    </button>
  )
}

export default BackButton
