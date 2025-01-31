import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Header from "../components/Header";
import ProfileContainer from "../components/ProfilePage/ProfileContainer";

function ProfilePage() {
  const { email } = useParams();
  const [userData, setUserData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [updatedData, setUpdatedData] = useState({});
  const [cities, setCities] = useState([]);

  const location = useLocation();
  const canEdit = location.state.canEdit;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedData((prevState) => ({ ...prevState, [name]: value }));
  };

  useEffect(() => {
    axios
      .get(`http://localhost:5000/user?email=${email}`)
      .then((response) => {
        const fetchedData = response.data;
        setUserData(fetchedData);
        setUpdatedData(fetchedData);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });

    axios
      .get("http://localhost:5000/cities")
      .then((response) => {
        setCities(response.data);
      })
      .catch((error) => {
        console.error("Error fetching cities:", error);
      });
  }, [email]);

  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setUpdatedData(userData);
  };

  const handleSave = async () => {
    if (!updatedData.ime || !updatedData.prezime || !updatedData.username) {
      alert("Name, Surname, and Username fields are required!");
      return;
    }

    try {
      const response = await axios.get("http://localhost:5000/checkUsername", {
        params: {
          username: updatedData.username,
          currentUserId: userData.korisnik_id,
        },
      });

      if (response.data === "Username already exists.") {
        alert(response.data);
        return;
      }

      await axios.put("http://localhost:5000/userUpdate", updatedData);
      setUserData(updatedData);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving data: ", error);
      alert("Error updating data");
    }
  };

  if (!userData || !cities) return <div>Loading...</div>;

  return (
    <div className="profilePage">
      <Header />
      <div className="profile-page">
        <ProfileContainer
          isEditing={isEditing}
          updatedData={updatedData}
          handleInputChange={handleInputChange}
          userData={userData}
          cities={cities}
          setUpdatedData={setUpdatedData}
          handleCancel={handleCancel}
          handleSave={handleSave}
          handleEdit={handleEdit}
          canEdit={canEdit}
        />
      </div>
    </div>
  );
}

export default ProfilePage;
