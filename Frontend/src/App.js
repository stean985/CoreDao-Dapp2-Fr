import { useEffect, useState, useCallback } from 'react';
import { ethers } from 'ethers';
import StakingToken from './contracts/StakingToken.json';
import StakingDapp from './contracts/StakingDapp.json';
import RewardToken from './contracts/RewardToken.json';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Modal from './components/Modal';
import './App.css';
import coreLogo from './core-logo.png';

const stakingDappAddress = '0x164F2b0D56295b4Fbe906D3Cb1f36F1e018bD1C3';
const stakingTokenAddress = '0x83EBb7892e17B8917CebaDb1d8b81fbf41241d98';
const rewardTokenAddress = '0xa96dEB31571459E84DD646d84430a8C693714eBf'; 

function App() {
  const [stakingAmount, setStakingAmount] = useState('');
  const [unstakingAmount, setUnstakingAmount] = useState('');
  const [currentAccount, setCurrentAccount] = useState(null);
  const [stakedAmount, setStakedAmount] = useState('0');
  const [rewardAmount, setRewardAmount] = useState('0');
  const [totalStkBalance, setTotalStkBalance] = useState('0');
  const [network, setNetwork] = useState('');
  const [faucetAmount, setFaucetAmount] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [stakingTokenDecimals, setStakingTokenDecimals] = useState(18);
  const [rewardTokenDecimals, setRewardTokenDecimals] = useState(18);

  
  // Check if wallet is connected
  const checkWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('Rassurez-vous que Metamask est installé!');
      return;
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_accounts' });

      if (accounts.length !== 0) {
        const account = accounts[0];
        setCurrentAccount(account);
      } else {
        console.log('Aucun compte autorisé trouvé');
      }
    } catch (error) {
      console.error('Erreur dans la recherche des comptes:', error);
    }
  };

  // Check network
  const checkNetwork = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log('objet Ethereum introuvable');
      return;
    }

    try {
      const provider = new ethers.providers.Web3Provider(ethereum);
      const { chainId } = await provider.getNetwork();

      if (chainId !== 1115) {
        alert('Veuillez vous connecter au réseau Core Testnet');
      } else {
        setNetwork('Core Testnet');
      }
    } catch (error) {
      console.error('Erreur dans la recherche du réseau:', error);
    }
  };

  // Connect wallet
  const connectWalletHandler = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      alert('Veuillez installer Metamask!');
      return;
    }

    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error('Erreur de connexion au portefeuille:', error);
    }
  };

  // Disconnect wallet
  const disconnectWalletHandler = () => {
    setCurrentAccount(null);
    setStakedAmount('0');
    setRewardAmount('0');
    setTotalStkBalance('0');
    setNetwork('');
  };

  // Fetch staked and reward amounts
  const fetchStakedAndRewardAmounts = useCallback(async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const stakingDappContract = new ethers.Contract(stakingDappAddress, StakingDapp.abi, signer);

        const stakedAmount = await stakingDappContract.getStakedAmount(currentAccount);
        const rewardAmount = await stakingDappContract.getRewardAmount(currentAccount);

        setStakedAmount(ethers.utils.formatUnits(stakedAmount, stakingTokenDecimals));
        setRewardAmount(ethers.utils.formatUnits(rewardAmount, rewardTokenDecimals));
      } else {
        console.log('objet Ethereum inexistant');
      }
    } catch (error) {
      console.error('Erreur dans la récupération des montants stakés et des récompenses:', error);
    }
  }, [currentAccount, stakingTokenDecimals, rewardTokenDecimals]);

  // Fetch staking token balance
  const fetchStkBalance = useCallback(async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const stakingTokenContract = new ethers.Contract(stakingTokenAddress, StakingToken.abi, provider);

        const balance = await stakingTokenContract.balanceOf(currentAccount);
        const decimals = await stakingTokenContract.decimals();
        setStakingTokenDecimals(decimals);
        setTotalStkBalance(ethers.utils.formatUnits(balance, decimals));
      } else {
        console.log('objet Ethereum inexistant');
      }
    } catch (error) {
      console.error('Erreur dans la récupération du solde des jetons:', error);
    }
  }, [currentAccount]);

  // Fetch reward token decimals
  const fetchRewardTokenDecimals = useCallback(async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const rewardTokenContract = new ethers.Contract(rewardTokenAddress, RewardToken.abi, provider);

        const decimals = await rewardTokenContract.decimals();
        setRewardTokenDecimals(decimals);
      } else {
        console.log('objet Ethereum object inexistant');
      }
    } catch (error) {
      console.error('Erreur dans la récupération des décimales des jetons de récompense:', error);
    }
  }, []);

  useEffect(() => {
    checkWalletIsConnected();
  }, []);

  useEffect(() => {
    if (currentAccount) {
      checkNetwork();
      fetchStakedAndRewardAmounts();
      fetchStkBalance();
      fetchRewardTokenDecimals();
    }
  }, [currentAccount, fetchStakedAndRewardAmounts, fetchStkBalance, fetchRewardTokenDecimals]);


  // Stake tokens
  const stakeTokens = async () => {
    try {
      if (!isValidAmount(stakingAmount)) {
        toast.error('Montant de staking invalide. Veuillez entrer un nombre positif.');
        return;
      }

      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const stakingDappContract = new ethers.Contract(stakingDappAddress, StakingDapp.abi, signer);
        const tokenContract = new ethers.Contract(stakingTokenAddress, StakingToken.abi, signer);

        await tokenContract.approve(stakingDappAddress, ethers.utils.parseUnits(stakingAmount, stakingTokenDecimals));
        const tx = await stakingDappContract.stake(ethers.utils.parseUnits(stakingAmount, stakingTokenDecimals));
        await tx.wait();
        toast.success('Staking réussi');
        fetchStakedAndRewardAmounts();
        fetchStkBalance();
      } else {
        console.log('objet Ethereum inexistant');
      }
    } catch (error) {
      console.error('Erreur de staking de jetons:', error);
      toast.error('Erreur de staking de jetons');
    }
  };

  // Unstake tokens
  const unstakeTokens = async () => {
    try {
      if (!isValidAmount(unstakingAmount)) {
        toast.error('Le montant du déblocage est invalide. Veuillez entrer un nombre positif.');
        return;
      }

      // Check if unstaking amount is greater than the staked amount
      if (parseFloat(unstakingAmount) > parseFloat(stakedAmount)) {
        toast.error('Entrer une valeur égale ou inférieure à la valeur de STK mise en jeu.');
        return;
      }

      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const stakingDappContract = new ethers.Contract(stakingDappAddress, StakingDapp.abi, signer);

        const amount = ethers.utils.parseUnits(unstakingAmount, stakingTokenDecimals);
        const tx = await stakingDappContract.unstake(amount);
        await tx.wait();
        toast.success('Déstaking réussi');
        fetchStakedAndRewardAmounts();
        fetchStkBalance();
      } else {
        console.log('objet Ethereum inexistant');
      }
    } catch (error) {
      console.error('Erreur de déstaking de jetons:', error);
      toast.error('Erreur de déstaking de jetons');
    }
  };

  // Open reward modal
  const openRewardModal = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const stakingDappContract = new ethers.Contract(stakingDappAddress, StakingDapp.abi, signer);

        const reward = await stakingDappContract.getRewardAmount(currentAccount);
        const formattedReward = ethers.utils.formatUnits(reward, rewardTokenDecimals);
        console.log(formattedReward);
        if (parseFloat(formattedReward) > 0) {
          setRewardAmount(formattedReward);
          setIsModalOpen(true);
        } else {
          toast.info('Aucune récompense disponible à réclamer.');
        }
      } else {
        console.log('objet Ethereum inexistant');
      }
    } catch (error) {
      console.error('Erreur pour obtenir le montant de la récompense :', error);
      toast.error('Erreur pour obtenir le montant de la récompense');
    }
  };

  // Claim reward
  const claimReward = async () => {
    try {
      if (parseFloat(rewardAmount) <= 0) {
        toast.error('Impossible de réclamer une récompense. Le montant doit être supérieur à zéro.');
        return;
      }
  
      const { ethereum } = window;
  
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const stakingDappContract = new ethers.Contract(stakingDappAddress, StakingDapp.abi, signer);
  
        // Set a high manual gas limit
        const gasLimit = 5000000; // Higher limit to ensure success
  
        // Try sending the transaction with a higher gas limit
        const tx = await stakingDappContract.claimReward({
          gasLimit: gasLimit
        });
        await tx.wait();
        toast.success('Récompense réclamée avec succès');
        setIsModalOpen(false);
        fetchStakedAndRewardAmounts();
        fetchStkBalance();
      } else {
        console.log('objet Ethereum inexistant');
      }
    } catch (error) {
      console.error('Erreur dans la réclamation de récompense:', error);
      toast.error('Erreur dans la réclamation de récompense. Veuillez vérifier la console pour plus de details.');
    }
  };

  // Faucet tokens
  const faucetTokens = async (amount) => {
    try {
      if (!isValidAmount(amount)) {
        toast.error('Montant du robinet invalide. Veuillez entrer un nombre positif inférieur à 100.');
        return;
      }

      const parsedAmount = parseFloat(amount);
      if (parsedAmount >= 100) {
        toast.error('Le montant de la demande doit être inférieur à 100.');
        return;
      }

      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const stakingTokenContract = new ethers.Contract(stakingTokenAddress, StakingToken.abi, signer);

        const gasLimit = 600000;

        const tx = await stakingTokenContract.mint(currentAccount, ethers.utils.parseUnits(amount, stakingTokenDecimals), {
          gasLimit: gasLimit
        });
        await tx.wait();
        toast.success('Jetons mintés avec succès');
        fetchStkBalance();
      } else {
        console.log('objet Ethereum inexistant');
      }
    } catch (error) {
      console.error('Erreur de frappe des jetons:', error);
      toast.error('Erreur de frappe des jetons');
    }
  };

  // Validate amount
  const isValidAmount = (amount) => {
    return !isNaN(Number(amount)) && parseFloat(amount) > 0;
  };

  return (
    <div className="App">
      <header className="App-header">
        <div className="logo-container">
        <img src={coreLogo} alt="Core Logo" className="logo" />
        </div>
        <h1>Staking Dapp</h1>
        {currentAccount && (
          <button onClick={disconnectWalletHandler} className="btn-primary disconnect-btn">
            Déconnectez le portefeuile
          </button>
        )}
      </header>
      <main>
        {!currentAccount ? (
          <button onClick={connectWalletHandler} className="btn-primary">
            Connectez le portefeuille
          </button>
        ) : (
          <>
            <div className="ticker-container">
              <p>Solde STK: {totalStkBalance} STK</p>
              <p>Montant STK Staké: {stakedAmount} STK</p>
              <p>Montant de Récompense Réclamable: {rewardAmount} RTK</p>
              <button onClick={openRewardModal} className="btn-primary">
                Réclamer Récompense
              </button>
            </div>
            <div>
              <input
                type="text"
                placeholder="Amount to stake"
                value={stakingAmount}
                onChange={(e) => setStakingAmount(e.target.value)}
                className="input-field"
              />
              <button onClick={stakeTokens} className="btn-primary">
                Stakez
              </button>
            </div>
            <div>
              <input
                type="text"
                placeholder="Amount to unstake"
                value={unstakingAmount}
                onChange={(e) => setUnstakingAmount(e.target.value)}
                className="input-field"
              />
              <button onClick={unstakeTokens} className="btn-primary">
                Déstakez
              </button>
            </div>
            <div>
              <input
                type="text"
                placeholder="Faucet amount"
                value={faucetAmount}
                onChange={(e) => setFaucetAmount(e.target.value)}
                className="input-field"
              />
              <button onClick={() => faucetTokens(faucetAmount)} className="btn-primary">
                STK Faucet
              </button>
            </div>
          </>
        )}
      </main>
      <ToastContainer />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClaim={claimReward}
        rewardAmount={rewardAmount}
      />
    </div>
  );
}

export default App;