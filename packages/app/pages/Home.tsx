import { useAppSelector } from "../hooks";
import { selectTheme } from "../theme/themeSlice";
import { selectIsLoggedIn, selectCurrentUser } from "../../auth/authSlice";
import PubCybots from "ai/cybot/web/PubCybots";
import WelcomeSection from "./WelcomeSection";
import GuideSection from "./GuideSection";
import SectionHeader from "./SectionHeader";
import { FiGlobe } from "react-icons/fi";

const Home = () => {
  const theme = useAppSelector(selectTheme);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);
  const currentUser = useAppSelector(selectCurrentUser);

  return (
    <div className="home-container">
      {isLoggedIn && currentUser ? <GuideSection /> : <WelcomeSection />}

      <section className="community-section">
        <SectionHeader
          title="探索社区 AI"
          icon={<FiGlobe />}
          linkText="浏览更多"
          linkTo="/explore"
        />
        <div className="cybots-container">
          <PubCybots limit={9} />
        </div>
      </section>

      <style>{`
        .home-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 1.5rem;
        }

        .community-section {
          opacity: 0;
          animation: fadeIn 0.8s ease forwards;
          animation-delay: 0.2s;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        
        .cybots-container {
          margin-bottom: 3rem;
          min-height: 200px;
        }





    

    
        .email-hint {
          font-size: 0.8rem;
          color: ${theme.textSecondary};
          margin-left: 3px;
        }

        @media (max-width: 768px) {
          .home-container {
            padding: 1rem;
          }

       
        }

   
      `}</style>
    </div>
  );
};

export default Home;
