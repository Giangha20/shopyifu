using System;
using System.Diagnostics;
using System.IO;
using System.Net;
using System.Threading;
using System.Windows.Forms;
using System.Drawing;

namespace LuxeShop
{
    static class Program
    {
        private const string AppTitle = "LUXE SHOP - Cửa Hàng Thời Trang";
        private const string TargetUrl = "http://localhost:3000";
        private const string UserDataFolder = "luxe-customer-data";
        private const string ProjectDir = @"C:\Users\giang\.gemini\antigravity\scratch\luxe-shop";

        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            if (!IsServerRunning())
            {
                using (SplashForm splash = new SplashForm("Đang khởi động LUXE SHOP Server...", AppTitle))
                {
                    splash.Show();
                    Application.DoEvents();

                    StartServer();

                    int elapsed = 0;
                    while (!IsServerRunning() && elapsed < 35000)
                    {
                        Thread.Sleep(500);
                        elapsed += 500;
                        Application.DoEvents();
                    }

                    splash.Close();
                }
            }

            LaunchBrowserApp();
        }

        static bool IsServerRunning()
        {
            try
            {
                HttpWebRequest req = (HttpWebRequest)WebRequest.Create(TargetUrl + "/api/settings");
                req.Timeout = 1500;
                req.Method = "GET";
                using (HttpWebResponse res = (HttpWebResponse)req.GetResponse())
                {
                    return res.StatusCode == HttpStatusCode.OK;
                }
            }
            catch
            {
                return false;
            }
        }

        static void StartServer()
        {
            try
            {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = "powershell.exe";
                psi.Arguments = "-NoProfile -ExecutionPolicy Bypass -Command \"npm run start\"";
                psi.WorkingDirectory = ProjectDir;
                psi.WindowStyle = ProcessWindowStyle.Hidden;
                psi.CreateNoWindow = true;
                psi.UseShellExecute = false;
                Process.Start(psi);
            }
            catch (Exception ex)
            {
                MessageBox.Show("Lỗi khi khởi động server: " + ex.Message, "Lỗi", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        static void LaunchBrowserApp()
        {
            string edgePath = @"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe";
            string chromePath = @"C:\Program Files\Google\Chrome\Application\chrome.exe";
            string browserPath = File.Exists(edgePath) ? edgePath : (File.Exists(chromePath) ? chromePath : null);

            string dataDir = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData), "LuxeShop", UserDataFolder);
            try { Directory.CreateDirectory(dataDir); } catch {}

            if (browserPath != null)
            {
                ProcessStartInfo psi = new ProcessStartInfo();
                psi.FileName = browserPath;
                psi.Arguments = string.Format("--app=\"{0}\" --user-data-dir=\"{1}\" --window-size=1300,850", TargetUrl, dataDir);
                Process.Start(psi);
            }
            else
            {
                Process.Start(TargetUrl);
            }
        }
    }

    class SplashForm : Form
    {
        public SplashForm(string message, string title)
        {
            this.Text = title;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.ClientSize = new Size(380, 140);
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.BackColor = Color.FromArgb(26, 26, 26);

            Label lblTitle = new Label();
            lblTitle.Text = "LUXE SHOP";
            lblTitle.Font = new Font("Georgia", 16, FontStyle.Bold);
            lblTitle.ForeColor = Color.FromArgb(201, 169, 110);
            lblTitle.Location = new Point(20, 20);
            lblTitle.AutoSize = true;
            this.Controls.Add(lblTitle);

            Label lblMsg = new Label();
            lblMsg.Text = message;
            lblMsg.Font = new Font("Segoe UI", 9);
            lblMsg.ForeColor = Color.White;
            lblMsg.Location = new Point(20, 55);
            lblMsg.AutoSize = true;
            this.Controls.Add(lblMsg);

            ProgressBar pb = new ProgressBar();
            pb.Style = ProgressBarStyle.Marquee;
            pb.MarqueeAnimationSpeed = 30;
            pb.Location = new Point(20, 85);
            pb.Size = new Size(340, 14);
            this.Controls.Add(pb);
        }
    }
}
