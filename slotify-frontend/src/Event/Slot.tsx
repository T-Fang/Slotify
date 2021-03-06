import { IonAlert, IonButton, IonIcon, IonItem } from "@ionic/react";
import {
  addOutline,
  timeOutline,
  banOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";
import { useState } from "react";
import { SignupErrorResponse, SlotDetails } from "../types/Event";
import { useAuthState } from "../AuthContext";
import { useHistory } from "react-router";
import axios from "axios";

export enum SlotStatus {
  Waitlist = "Waitlist",
  Signup = "Signup",
}

interface SlotProps {
  slotDetails: SlotDetails;
}

const NO_PROFILE_STATUS = 452;
const BAD_REQUEST_STATUS = 400;

function Slot(slotProps: SlotProps): JSX.Element {
  const [slot, setSlot] = useState<SlotDetails>(slotProps.slotDetails);
  const [showProfileRedirect, setShowProfileRedirect] = useState(false);
  const [showSignupError, setShowSignupError] = useState(false);
  const [popupMessage, setErrorMessage] = useState("");
  const [popupDetails, setErrorDetails] = useState("");
  const userDetails = useAuthState();
  const history = useHistory();

  const toggleSignUp = () => {
    const method = slot.is_signed_up ? "delete" : "post";
    axios({
      method: method,
      url: `/events/slots/${slot.slot_id}/signups`,
      headers: {
        Authorization: `Bearer ${userDetails.accessToken}`,
      },
    })
      .then((response) => {
        fetchUpdatedSlot();
      })
      .catch((error) => {
        console.error(error.response.data);

        const status = error.response.status;
        switch (status) {
          case NO_PROFILE_STATUS:
            setShowProfileRedirect(true);
            break;
          case BAD_REQUEST_STATUS:
            const errorData = error.response.data as SignupErrorResponse;
            showPopupMessage(
              "You have already signed up for another slot for this event." +
                "\nPlease withdraw the other signup if you wish to sign up for this slot instead.",
              `Existing slot: <strong>${errorData.signup.slot?.tag.tag_name}</strong>`
            );
        }
      });
  };

  const showPopupMessage = (message: string, details: string) => {
    setErrorMessage(message);
    setErrorDetails(details);
    setShowSignupError(true);
  };

  const fetchUpdatedSlot = () => {
    axios
      .get(`/events/slots/${slot.slot_id}`, {
        headers: {
          Authorization: `Bearer ${userDetails.accessToken}`,
        },
      })
      .then((response) => {
        const updatedSlot = response.data as SlotDetails;
        setSlot(updatedSlot);
      })
      .catch((error) => {
        console.error(error.response.data);
      });
  };

  return (
    <IonItem
      color={
        slot.is_signed_up
          ? slot.is_confirmed
            ? "success"
            : "warning"
          : "light"
      }
      className="rounded-lg m-2"
    >
      <div className="my-2 w-3/4 h-24 flex flex-col justify-center">
        <p className="font-bold capitalize">{slot.tag.tag_name}</p>
        <p className="text-xs">Remaining slots: {slot.available_slot_count}</p>
        <p className="text-xs">
          People in waitlist: {slot.pending_signup_count}
        </p>
        {slot.is_signed_up && !slot.is_confirmed && (
          <p className="text-xs line-clamp-2">
            You are waitlisted and will be emailed when a slot is available.
          </p>
        )}
      </div>
      <IonButton
        shape="round"
        slot="end"
        className="h-1/3 w-1/4 m-0"
        disabled={!slot.is_eligible}
        onClick={toggleSignUp}
      >
        <IonIcon
          slot="icon-only"
          icon={
            slot.is_signed_up
              ? slot.is_confirmed
                ? checkmarkCircleOutline
                : timeOutline
              : slot.is_eligible
              ? addOutline
              : banOutline
          }
        />
      </IonButton>

      <IonAlert
        isOpen={showProfileRedirect}
        onDidDismiss={() => setShowProfileRedirect(false)}
        header={"User Profile required"}
        message={
          "Please fill in your profile before signing up for an event. You only need to do this once!"
        }
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
            cssClass: "secondary",
          },
          {
            text: "Go to Profile",
            handler: () => {
              setShowProfileRedirect(false);
              history.push("/profile");
            },
          },
        ]}
      />
      <IonAlert
        isOpen={showSignupError}
        onDidDismiss={() => setShowSignupError(false)}
        header={`Sign up error for ${slot?.tag.tag_name} slot`}
        subHeader={popupMessage}
        message={popupDetails}
        buttons={["OK"]}
      />
    </IonItem>
  );
}

export default Slot;
