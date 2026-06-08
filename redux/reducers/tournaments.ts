import {
  getTournamentsByLocation,
  getTournamentsDetails,
  createTournament,
  createTeam,
  deleteTeamFromTournament,
  generateTournamentBracket,
} from "@/api/tournamentThunk";
import {
  Tournament,
  TournamentDetailsResponse,
  CreateTournamentResponse,
  StartTournamentResponse,
} from "@/components/typings/apiResponse";
import { createSlice } from "@reduxjs/toolkit";

interface State {
  tournamentsByLocation: Tournament[] | null;
  tournamentsDetails: TournamentDetailsResponse | null;
  createTournamentInLocation: CreateTournamentResponse | null;
  createTournamentTeam: CreateTournamentResponse | null;
  deleteTournamentTeam: null;
  startTournament: StartTournamentResponse | null;

  loadingTournamentsByLocation: boolean;
  loadingTournamentsDetails: boolean;
  loadingCreateTournamentInLocation: boolean;
  loadingCreateTournamentTeam: boolean;
  loadingDeleteTournamentTeam: boolean;
  loadingStartTournament: boolean;

  errorTournamentsByLocation: string | null;
  errorTournamentsDetails: string | null;
  errorCreateTournamentInLocation: string | null;
  errorCreateTournamentTeam: string | null;
  errorDeleteTournamentTeam: string | null;
  errorStartTournament: string | null;
}

const initialState: State = {
  tournamentsByLocation: null,
  tournamentsDetails: null,
  createTournamentInLocation: null,
  createTournamentTeam: null,
  deleteTournamentTeam: null,
  startTournament: null,

  loadingTournamentsByLocation: false,
  loadingTournamentsDetails: false,
  loadingCreateTournamentInLocation: false,
  loadingCreateTournamentTeam: false,
  loadingDeleteTournamentTeam: false,
  loadingStartTournament: false,

  errorTournamentsByLocation: null,
  errorTournamentsDetails: null,
  errorCreateTournamentInLocation: null,
  errorCreateTournamentTeam: null,
  errorDeleteTournamentTeam: null,
  errorStartTournament: null,
};

export const tournamentSlice = createSlice({
  name: "tournament",
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder.addCase(getTournamentsByLocation.pending, (state) => {
      state.loadingTournamentsByLocation = true;
      state.errorTournamentsByLocation = null;
    });

    builder.addCase(
      getTournamentsByLocation.fulfilled,
      (state, { payload }) => {
        state.tournamentsByLocation = payload;
        state.loadingTournamentsByLocation = false;
      },
    );

    builder.addCase(getTournamentsByLocation.rejected, (state, action) => {
      state.loadingTournamentsByLocation = false;
      state.errorTournamentsByLocation =
        action.error.message || "Failed to fetch Tournaments";
    });

    // tournaments details
    builder.addCase(getTournamentsDetails.pending, (state) => {
      state.loadingTournamentsDetails = true;
      state.errorTournamentsDetails = null;
    });

    builder.addCase(getTournamentsDetails.fulfilled, (state, { payload }) => {
      state.tournamentsDetails = payload;
      state.loadingTournamentsDetails = false;
    });

    builder.addCase(getTournamentsDetails.rejected, (state, action) => {
      state.loadingTournamentsDetails = false;
      state.errorTournamentsDetails =
        action.error.message || "Failed to fetch Tournaments details";
    });

    // create tournament
    builder.addCase(createTournament.pending, (state) => {
      state.loadingCreateTournamentInLocation = true;
      state.errorCreateTournamentInLocation = null;
    });

    builder.addCase(createTournament.fulfilled, (state, { payload }) => {
      state.createTournamentInLocation = payload;
      state.loadingCreateTournamentInLocation = false;
    });

    builder.addCase(createTournament.rejected, (state, action) => {
      state.loadingCreateTournamentInLocation = false;
      state.errorCreateTournamentInLocation =
        action.error.message || "Failed to create tournament";
    });

    // create tournament team
    builder.addCase(createTeam.pending, (state) => {
      state.loadingCreateTournamentTeam = true;
      state.errorCreateTournamentTeam = null;
    });

    builder.addCase(createTeam.fulfilled, (state, { payload }) => {
      state.createTournamentTeam = payload;
      state.loadingCreateTournamentTeam = false;
    });

    builder.addCase(createTeam.rejected, (state, action) => {
      state.loadingCreateTournamentTeam = false;
      state.errorCreateTournamentTeam =
        action.error.message || "Failed to create tournament team";
    });

    // delete tournament team
    builder.addCase(deleteTeamFromTournament.pending, (state) => {
      state.loadingDeleteTournamentTeam = true;
      state.errorDeleteTournamentTeam = null;
    });

    builder.addCase(deleteTeamFromTournament.fulfilled, (state) => {
      state.loadingDeleteTournamentTeam = false;
    });

    builder.addCase(deleteTeamFromTournament.rejected, (state, action) => {
      state.loadingDeleteTournamentTeam = false;
      state.errorDeleteTournamentTeam =
        action.error.message || "Failed to delete tournament team";
    });

    // start tournament
    builder.addCase(generateTournamentBracket.pending, (state) => {
      state.loadingStartTournament = true;
      state.errorStartTournament = null;
    });

    builder.addCase(
      generateTournamentBracket.fulfilled,
      (state, { payload }) => {
        state.startTournament = payload;
        state.loadingStartTournament = false;
      },
    );

    builder.addCase(generateTournamentBracket.rejected, (state, action) => {
      state.loadingStartTournament = false;
      state.errorStartTournament =
        action.error.message || "Failed to generate Tournament Bracket";
    });
  },
});

export default tournamentSlice.reducer;
