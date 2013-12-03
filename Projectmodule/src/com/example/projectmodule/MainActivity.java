package com.example.projectmodule;

import android.net.Uri;
import android.os.Bundle;
import android.app.Activity;
import android.content.Intent;
import android.view.Menu;
import android.view.View;
import android.widget.Button;
import android.widget.ImageButton;

public class MainActivity extends Activity {

	ImageButton addButton;
	ImageButton activityButton;
	ImageButton removeButton;
	ImageButton outputButton;
	ImageButton adminButton;
	
	@Override
	protected void onCreate(Bundle savedInstanceState) {
		super.onCreate(savedInstanceState);
		setContentView(R.layout.activity_main);
		
        // Buttons
		addButton = (ImageButton) findViewById(R.id.addButton);
		activityButton = (ImageButton) findViewById(R.id.activityButton);
		removeButton = (ImageButton) findViewById(R.id.removeButton);
		outputButton = (ImageButton) findViewById(R.id.outputButton);
		adminButton = (ImageButton) findViewById(R.id.adminButton);
		
 
        // view products click event
		addButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                // Launching All products Activity
                Intent in = new Intent(getApplicationContext(), AddActivity.class);
                //i.putExtra("city",  City.getText().toString());
                startActivity(in);
             }
        });
		
		
		activityButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent in = new Intent(getApplicationContext(), LogActivity.class);
                startActivity(in);
             }
        });
		
		
		removeButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent in = new Intent(getApplicationContext(), RemoveActivity.class);
                startActivity(in);
             }
        });
		
		
		outputButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                //Intent in = new Intent(getApplicationContext(), WebActivity.class);
                //startActivity(in);
            	//Uri uri = Uri.parse("http://www.cs.indiana.edu/cgi-pub/vrajasek/Pervasive-Project/QViz/index.html");
            	//Intent intent = new Intent(Intent.ACTION_VIEW, uri);
            	Intent in = new Intent(getApplicationContext(), WebActivity.class);
            	startActivity(in);
             }
        });
		
		
		adminButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                Intent in = new Intent(getApplicationContext(), AdminActivity.class);
                startActivity(in);
             }
        });
		
		
	}

	@Override
	public boolean onCreateOptionsMenu(Menu menu) {
		// Inflate the menu; this adds items to the action bar if it is present.
		getMenuInflater().inflate(R.menu.activity_main, menu);
		return true;
	}

}
