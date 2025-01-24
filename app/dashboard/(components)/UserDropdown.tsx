import { KeyRound, LogOut } from "lucide-react";

interface UserDropdownProps {
    onChangePin: () => void;
    onLogout: () => void;
  }
  
  export const UserDropdown: React.FC<UserDropdownProps> = ({ onChangePin, onLogout }) => {
    return (
      <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50">
        <div className="py-1">
          <button 
            onClick={onChangePin}
            className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 text-gray-700"
          >
            <KeyRound className="mr-2 h-4 w-4" />
            Change PIN
          </button>
          <button 
            onClick={onLogout}
            className="flex items-center w-full px-4 py-2 text-left hover:bg-gray-100 text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </button>
        </div>
      </div>
    );
  };
  