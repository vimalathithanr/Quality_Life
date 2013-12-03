package com.example.projectmodule;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

import org.apache.http.NameValuePair;
import org.apache.http.message.BasicNameValuePair;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.Dialog;
import android.app.ListActivity;
import android.app.ProgressDialog;
import android.content.DialogInterface;
import android.content.Intent;
import android.graphics.Color;
import android.os.AsyncTask;
import android.os.Bundle;
import android.util.Log;
import android.view.View;
import android.widget.AdapterView;
import android.widget.AdapterView.OnItemClickListener;
import android.widget.EditText;
import android.widget.LinearLayout;
import android.widget.ListAdapter;
import android.widget.ListView;
import android.widget.RadioButton;
import android.widget.SimpleAdapter;
import android.widget.TextView;

public class LogActivity extends ListActivity {

	private ProgressDialog pDialog;
	String pid;
	String pid1;

	// Creating JSON Parser object
	JSONParser jParser = new JSONParser();
	JSONParser jParser1 = new JSONParser();
	Helper helper = new Helper();

	ArrayList<HashMap<String, String>> productsList;

	// url to get all products list
	private static String url_all_products = "http://www.cs.indiana.edu/cgi-pub/vrajasek/Pervasive-Project/QViz/php/ActivityLog.php";
	private static String url_create_product = "http://www.cs.indiana.edu/cgi-pub/vrajasek/Pervasive-Project/QViz/php/Quality.php";

	// JSON Node names
	private static final String TAG_SUCCESS = "success";
	private static final String TAG_PRODUCTS = "mastertable";
	private static final String TAG_PID = "Activity";
	private static final String TAG_NAME = "User";
	private static final String TAG_MINTIME = "MinTime";
	private static final String TAG_MAXTIME = "MaxTime";
	String ActivityIDVim;

	// products JSONArray
	JSONArray products = null;

	@Override
	public void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.all_products1);

		// pid = getIntent().getExtras().getString("pid");
		// System.out.println(pid);

		// Hashmap for ListView
		productsList = new ArrayList<HashMap<String, String>>();

		// Loading products in Background Thread
		new LoadAllProducts().execute();

		// Get listview
		ListView lv = getListView();

		// on seleting single product
		// launching Edit Product Screen
		lv.setOnItemClickListener(new OnItemClickListener() {

			@Override
			public void onItemClick(AdapterView<?> parent, View view,
					int position, long id) {

				// getting values from selected ListItem
				String pid = ((TextView) view.findViewById(R.id.name))
						.getText().toString();

				Intent i = new Intent(getApplicationContext(),
						EditLogActivity.class);
				startActivity(i);

			}
		});
	}

	class LoadAllProducts extends AsyncTask<String, String, String> {

		/**
		 * Before starting background thread Show Progress Dialog
		 * */
		@Override
		protected void onPreExecute() {
			super.onPreExecute();
			pDialog = new ProgressDialog(LogActivity.this);
			pDialog.setMessage("Loading... Please wait...");
			pDialog.setIndeterminate(false);
			pDialog.setCancelable(false);
			pDialog.show();
		}

		/**
		 * getting All products from url
		 * */
		protected String doInBackground(String... args) {

			// Building Parameters
			List<NameValuePair> params = new ArrayList<NameValuePair>();
			// params.add(new BasicNameValuePair("pid", pid));

			// getting JSON string from URL
			JSONObject json = jParser.makeHttpRequest(url_all_products, "GET",
					params);

			// Check your log cat for JSON reponse
			Log.d("All Records: ", json.toString());

			try {
				// Checking for SUCCESS TAG
				int success = json.getInt(TAG_SUCCESS);

				if (success == 1) {
					// products found
					// Getting Array of Products
					products = json.getJSONArray(TAG_PRODUCTS);

					HashMap<String, HashMap<String, String>> activityList = new HashMap<String, HashMap<String, String>>();

					// looping through All Products
					for (int i = 0; i < products.length(); i++) {
						JSONObject c = products.getJSONObject(i);
						// Storing each json item in variable
						String id = c.getString(TAG_PID)
								+ c.getString(TAG_NAME);
						// creating new HashMap

						HashMap<String, String> eachRow = null;

						if (activityList.containsKey(c.getString(TAG_PID))) {
							eachRow = activityList.get(c.getString(TAG_PID));

							eachRow.put(TAG_NAME, eachRow.get(TAG_NAME) + ","
									+ c.getString(TAG_NAME));
						} else {

							eachRow = new HashMap<String, String>();

							// eachRow.put(TAG_PID, c.getString(TAG_PID));
							// eachRow.put(TAG_MAXTIME,
							// c.getString(TAG_MAXTIME));
							// eachRow.put(TAG_MINTIME,
							// c.getString(TAG_MINTIME));

							String minTime = c.getString(TAG_MINTIME);

							eachRow.put(
									TAG_NAME,
									c.getString(TAG_PID)
											+ c.getString(TAG_MAXTIME)
											+ "       " + minTime.substring(11)
											+ "       " + c.getString(TAG_NAME));

							activityList.put(c.getString(TAG_PID), eachRow);

						}

						/*
						 * //String id = c.getString(TAG_PID);
						 * System.out.println(TAG_PID); String name =
						 * c.getString(TAG_NAME) + c.getString(TAG_MINTIME) +
						 * c.getString(TAG_MAXTIME);
						 * 
						 * // adding each child node to HashMap key => value
						 * map.put(TAG_PID, id); map.put(TAG_NAME, name);
						 */
						// adding HashList to ArrayList

					}

					for (String activity : activityList.keySet()) {
						productsList.add(activityList.get(activity));
					}

				}
			} catch (JSONException e) {
				e.printStackTrace();
			}

			return null;
		}

		/**
		 * After completing background task Dismiss the progress dialog
		 * **/
		protected void onPostExecute(String file_url) {
			// dismiss the dialog after getting all products
			pDialog.dismiss();
			// updating UI from Background Thread
			runOnUiThread(new Runnable() {
				public void run() {
					/**
					 * Updating parsed JSON data into ListView
					 * */
					ListAdapter adapter = new SimpleAdapter(LogActivity.this,
							productsList, R.layout.list_item1, new String[] {
									TAG_PID, TAG_NAME }, new int[] { R.id.pid,
									R.id.name });
					// updating listview
					setListAdapter(adapter);
				}
			});

		}

	}

	/**
	 * Background Async Task to Create new product
	 * */
	class CreateNewProduct extends AsyncTask<String, String, String> {

		/**
		 * Before starting background thread Show Progress Dialog
		 * */
		@Override
		protected void onPreExecute() {
			super.onPreExecute();
			pDialog = new ProgressDialog(LogActivity.this);
			pDialog.setMessage("Creating Product..");
			pDialog.setIndeterminate(false);
			pDialog.setCancelable(true);
			pDialog.show();
		}

		/**
		 * Creating product
		 * */
		protected String doInBackground(String... args) {

			String ActivityID = "2";
			String IsQualityTime = "0";
			String Comments = "Android";
			// Building Parameters
			List<NameValuePair> params = new ArrayList<NameValuePair>();
			params.add(new BasicNameValuePair("ActivityID", ActivityID));
			params.add(new BasicNameValuePair("IsQualityTime", IsQualityTime));
			params.add(new BasicNameValuePair("Comments", Comments));

			// getting JSON Object
			// Note that create product url accepts POST method
			JSONObject json = jParser.makeHttpRequest(url_create_product,
					"POST", params);

			// check log cat fro response
			Log.d("Create Response", json.toString());

			// check for success tag
			try {
				int success = json.getInt(TAG_SUCCESS);

				if (success == 1) {
					// successfully created product
					// Intent i = new Intent(getApplicationContext(),
					// AllProductsActivity.class);
					// startActivity(i);

					// closing this screen
					finish();
				} else {
					// failed to create product
				}
			} catch (JSONException e) {
				e.printStackTrace();
			}

			return null;
		}

		/**
		 * After completing background task Dismiss the progress dialog
		 * **/
		protected void onPostExecute(String file_url) {
			// dismiss the dialog once done
			pDialog.dismiss();
		}

	}

}