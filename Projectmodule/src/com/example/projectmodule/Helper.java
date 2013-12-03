package com.example.projectmodule;

import java.util.ArrayList;

public class Helper {

	public String PID;
	public String MaxTime;
	public String MinTime;
	public ArrayList<String> User;
	public String setPID;

	public Helper() {
		User = new ArrayList<String>();
	}

	public String getPID() {
		return PID;
	}

	public void setPID(String pID) {
		PID = pID;
	}

	public String getMaxTime() {
		return MaxTime;
	}

	public void setMaxTime(String maxTime) {
		MaxTime = maxTime;
	}

	public String getMinTime() {
		return MinTime;
	}

	public void setMinTime(String minTime) {
		MinTime = minTime;
	}

	public ArrayList<String> getUser() {
		return User;
	}

	public void addUser(String user) {
		User.add(user);
	}

	@Override
	public String toString() {

		StringBuilder retVal = new StringBuilder();

		retVal.append(PID);
		retVal.append("," + MaxTime);
		retVal.append("," + MinTime);

		for (String user : User) {
			retVal.append("," + user);
		}

		return retVal.toString();

	}

}
