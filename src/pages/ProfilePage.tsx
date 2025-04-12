
import NavBar from '@/components/NavBar';
import UserProfile from '@/components/UserProfile';

const ProfilePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <UserProfile />
      </main>
    </div>
  );
};

export default ProfilePage;
