
import NavBar from '@/components/NavBar';
import UserManagement from '@/components/UserManagement';

const UsersPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <UserManagement />
      </main>
    </div>
  );
};

export default UsersPage;
