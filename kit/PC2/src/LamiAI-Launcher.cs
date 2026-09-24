using System;
using System.Diagnostics;
using System.Net.Sockets;
using System.Windows.Forms;

static class LamiAILauncher
{
    const string SERVER_IP = "100.104.240.32"; // PC de la Prof (Tailscale - partout)
    const int SERVER_PORT = 8080;
    const string URL = "http://100.104.240.32:8080";

    [STAThread]
    static int Main()
    {
        // essai de connexion rapide (TCP) au serveur
        bool reachable = IsReachable(SERVER_IP, SERVER_PORT, 3000);

        if (!reachable)
        {
            // verifie si Tailscale est au moins installe
            bool tailscaleUp = IsTailscaleUp();
            string msg = "Le serveur LamiAI (PC de la Prof) est injoignable.\n\n"
                       + "Verifie que :\n"
                       + " 1) Le PC de la Prof est allume\n"
                       + " 2) Tailscale est lance et CONNECTE avec le compte de la Prof\n"
                       + (tailscaleUp ? "  (Tailscale semble installe sur ce PC)\n" : "  (Tailscale ne semble pas installe sur ce PC)\n")
                       + "\nL'application va quand meme s'ouvrir (elle relancera).";
            MessageBox.Show(msg, "LamiAI - connexion", MessageBoxButtons.OK, MessageBoxIcon.Warning);
        }

        // lance l'app dans une fenetre applicative (mode app = pas de barre navigateur)
        OpenAppWindow();

        // re-essaie dans 8s si ce n'etait pas joignable et affiche le resultat
        if (!reachable)
        {
            System.Threading.Thread.Sleep(8000);
            if (!IsReachable(SERVER_IP, SERVER_PORT, 3000))
                MessageBox.Show("Toujours pas de connexion.\nVerifie Tailscale et que le PC de la Prof est allume.",
                                "LamiAI", MessageBoxButtons.OK, MessageBoxIcon.Warning);
        }
        return 0;
    }

    static bool IsReachable(string host, int port, int ms)
    {
        try
        {
            using (var c = new TcpClient())
            {
                var ar = c.BeginConnect(host, port, null, null);
                if (!ar.AsyncWaitHandle.WaitOne(ms)) return false;
                c.EndConnect(ar);
                return true;
            }
        }
        catch { return false; }
    }

    static bool IsTailscaleUp()
    {
        try
        {
            using (var p = new Process())
            {
                p.StartInfo.FileName = "tailscale";
                p.StartInfo.Arguments = "status";
                p.StartInfo.UseShellExecute = false;
                p.StartInfo.CreateNoWindow = true;
                p.StartInfo.RedirectStandardError = true;
                p.StartInfo.RedirectStandardOutput = true;
                if (!p.Start()) return false;
                string outp = (p.StandardOutput.ReadToEnd() + " " + p.StandardError.ReadToEnd()).ToLowerInvariant();
                return outp.Contains("100.");
            }
        }
        catch { return false; }
    }

    static void OpenAppWindow()
    {
        string edge = FindExe(new[]{
            Environment.ExpandEnvironmentVariables(@"%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"),
            Environment.ExpandEnvironmentVariables(@"%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"),
            Environment.ExpandEnvironmentVariables(@"%ProgramFiles%\Google\Chrome\Application\chrome.exe"),
            Environment.ExpandEnvironmentVariables(@"%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe")});
        if (edge != null)
        {
            // mode application : fenetre delie du navigateur
            Process.Start(edge, "--app=\"" + URL + "\" --new-window");
            return;
        }
        Process.Start("http://" + SERVER_IP + ":" + SERVER_PORT);
    }

    static string FindExe(string[] candidates)
    {
        foreach (var c in candidates)
            if (System.IO.File.Exists(c)) return c;
        return null;
    }
}