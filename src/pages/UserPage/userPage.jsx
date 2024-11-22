import React, { useState, useEffect } from 'react';
import styles from './userPage.module.css';
import transition from '../../components/Transition/transition';
import { useNavigate } from 'react-router-dom';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import avatarIcon from '../../assets/PessoaUsuario.png';
import userIcon from '../../assets/perfilUsuario.png';
import locationIcon from '../../assets/ELEMENTS.png';
import emailIcon from '../../assets/email.png';
import phoneIcon from '../../assets/phone.png';
import dogIcon from '../../assets/dogIcon.png';
import { useAuthValue } from '../../context/AuthContext';

const UserPage = () => {
  const { user, userInfo } = useAuthValue();
  console.log(user)
  console.log(userInfo);
  const [imgUrl, setImgUrl] = useState('');
  const [dogs, setDogs] = useState([]);
  const [requests, setRequests] = useState([]);
  const [historyRequests, setHistoryRequests] = useState([]);
  const [progress, setProgress] = useState(0);
  const [dogToDelete, setDogToDelete] = useState(null); // Estado para armazenar o cachorro que será excluído
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // Estado para controlar o diálogo de confirmação
  const navigate = useNavigate();

  const addDog = (newDog) => {
    setDogs([...dogs, newDog]);
  };

  const handleUpload = (event) => {
    event.preventDefault();

    const file = event.target[0]?.files[0];
    if (!file) return;

    const storageRef = ref(storage, `images/${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progress);
      },
      (error) => {
        alert(error.message);
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((url) => {
          setImgUrl(url);
        });
      }
    );
  };

  const goToCreateProfile = () => {
    navigate('/create-profile');
  };

  const acceptRequest = (requestId) => {
    setRequests(requests.filter((request) => request.id !== requestId));
    // Adicione lógica para atualizar o backend se necessário
  };

  const rejectRequest = (requestId) => {
    setRequests(requests.filter((request) => request.id !== requestId));
    // Adicione lógica para atualizar o backend se necessário
  };

  const cancelRequest = (requestId) => {
    setHistoryRequests(historyRequests.filter((request) => request.id !== requestId));
    // Adicione lógica para atualizar o backend se necessário
  };

  const fetchHistoryRequests = async () => {
    const response = await fetch('/api/history-requests'); 
    const data = await response.json();
    setHistoryRequests(data);
  };

  useEffect(() => {
    fetchHistoryRequests();
  }, []);

  const handleDeleteDog = (dog) => {
    setDogToDelete(dog);
    setShowConfirmDialog(true); // Exibir diálogo de confirmação
  };

  const confirmDeleteDog = async () => {
    try {
      // Exemplo de chamada API para deletar o perfil do cachorro
      await fetch(`/api/delete-dog/${dogToDelete.id}`, { method: 'DELETE' });
      setDogs(dogs.filter((dog) => dog.id !== dogToDelete.id)); // Atualizar a lista de cães
      setShowConfirmDialog(false);
      setDogToDelete(null); // Limpar o estado
    } catch (error) {
      alert('Erro ao excluir o perfil do cachorro.');
    }
  };

  return (
    <div className={styles.profileContainer}>
      <div className={styles.leftColumn}>
        <div className={styles.avatar}>
          {!imgUrl ? (
            <img src={avatarIcon} alt='Foto Perfil' className={styles.uploaded_image} />
          ) : (
            <img src={imgUrl} alt='Foto Perfil' className={styles.uploaded_image} />
          )}
        </div>

        <form onSubmit={handleUpload} className={styles.upload_form}>
          <h4>Alterar minha foto de Perfil</h4>
          <input type="file" className={styles.file_input} />
          <button type="submit" className={styles.upload_button}>Enviar</button>
          {progress > 0 && <p>Progresso: {progress.toFixed(2)}%</p>}
        </form>
      </div>

      <div className={styles.rightColumn}>
        <div className={styles.userInfo}>
        {userInfo ? (
          <><h1>{userInfo.nome}</h1><p>
              <img src={userIcon} alt="Ícone de Usuário" className={styles.icon} /> {userInfo.nome}
            </p><p>
                <img src={locationIcon} alt="Ícone de Localização" className={styles.icon} /> São Paulo, SP
              </p><p>
                <img src={emailIcon} alt="Ícone de Email" className={styles.icon} /> {userInfo.email}
              </p><p>
                <img src={phoneIcon} alt="Ícone de Telefone" className={styles.icon} /> {userInfo.telefone}
              </p><button className={styles.editButton}>Alterar meus dados</button><button className={styles.registerDogButton} onClick={goToCreateProfile}>
                Cadastre seu Cão
              </button></>
        ) : (
          <p>Loading user information...</p>
        )}
        </div>

        {/* Seção "Meus Cães" */}
        <div className={styles.dogsSection}>
          <h2>Meus Cães</h2>
          <div className={styles.dogsList}>
            {dogs.length === 0 ? (
              <p>Você ainda não cadastrou nenhum cão.</p>
            ) : (
              dogs.map((dog) => (
                <div key={dog.id} className={styles.dogCard}>
                  <img src={dogIcon} alt="Ícone de Cachorro" className={styles.dogIcon} />
                  <span>{dog.nome}</span>
                  <button onClick={() => handleDeleteDog(dog)} className={styles.deleteButton}>
                    Excluir Perfil
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dialogo de confirmação */}
        {showConfirmDialog && (
          <div className={styles.confirmDialog}>
            <p>Tem certeza de que deseja excluir o perfil do {dogToDelete.nome}? Esta ação não pode ser desfeita.</p>
            <button onClick={confirmDeleteDog} className={styles.confirmButton}>Confirmar</button>
            <button onClick={() => setShowConfirmDialog(false)} className={styles.cancelButton}>Cancelar</button>
          </div>
        )}

        {/* Seção "Solicitações de Cruzamento" */}
        <div className={styles.requestsSection}>
          <h2>Solicitações de Cruzamento</h2>
          <div className={styles.requestsList}>
            {requests.length === 0 ? (
              <p>Você não tem solicitações de cruzamento.</p>
            ) : (
              requests.map((request) => (
                <div key={request.id} className={styles.requestCard}>
                  <p>{request.dogName} deseja cruzar com o seu cão.</p>
                  <button onClick={() => acceptRequest(request.id)} className={styles.acceptButton}>
                    Aceitar
                  </button>
                  <button onClick={() => rejectRequest(request.id)} className={styles.rejectButton}>
                    Rejeitar
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Seção "Histórico de Solicitações" */}
        <div className={styles.historySection}>
          <h2>Histórico de Solicitações</h2>
          <div className={styles.historyList}>
            {historyRequests.length === 0 ? (
              <p>Você não tem solicitações enviadas.</p>
            ) : (
              historyRequests.map((request) => (
                <div key={request.id} className={styles.historyCard}>
                  <p>{request.dogName} - Status: {request.status}</p>
                  {request.status === 'pendente' && (
                    <button onClick={() => cancelRequest(request.id)} className={styles.cancelButton}>
                      Cancelar
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default transition(UserPage);
